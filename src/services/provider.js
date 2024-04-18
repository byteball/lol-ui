import { ethers } from "ethers";

import appConfig from "@/appConfig";

import { store } from "..";

import { updatePrice } from "@/store/thunks/updatePrice";
import { clearMarkets } from "@/store/slices/marketSlice";

class Provider {
	constructor(url) {
		this.url = url;
		this.online = navigator.onLine;

		if (this.online) {
			this.connect();
		} else {
			// dApp was opened with offline browser

			const connectingIntervalId = setInterval(() => {
				if (this.online) {
					this.connect();
					clearInterval(connectingIntervalId);
				} else {
					console.log("log: try connect every 500ms");
				}
			}, 1000);
		}

		window.addEventListener('online', () => {
			this.online = true;
			console.log('log: online');
		});

		window.addEventListener('offline', () => {
			this.online = false;
			this.close();

			console.log('log: offline');
		});

		this.connectingIntervalId = null;

		this.RECONNECT_INTERVAL = 5000; // ms
		this.TIME_OUT = 60 * 1000; // ms
		this.lastBlockTs = null;
		this.onConnectCb = [];
		this.onCloseCb = [];
		this.providerSubscribes = [];
		this.ready = false;
	}

	async close(alreadyDestroyed = false) {
		if (!this.provider) {
			console.log("log: can't close because provider doesn't exist");
			return;
		}

		this.ready = false;
		this.lastBlockTs = null;

		if (this.checkIntervalId) {
			clearInterval(this.checkIntervalId);
		}

		if (!alreadyDestroyed) {
			try {
				await this.provider.destroy();
			} catch (error) {
				console.error('error: while closing connection:', error);
			}
		}

		this.onCloseCb.forEach((onClose) => onClose());
	}

	onConnect(cb) {
		this.onConnectCb.push(cb);
	}

	onClose(cb) {
		this.onCloseCb.push(cb);
	}

	setProvider() {
		try {
			this.provider = new ethers.WebSocketProvider(this.url);
		} catch (error) {
			console.log('error: while setting up provider:', error);
			return this.close();
		}

		this.provider.websocket.addEventListener("open", () => {
			this.ready = true;

			if (this.connectingIntervalId) {
				clearInterval(this.connectingIntervalId);
				this.connectingIntervalId = null;
			}

			console.log("log: open connection");

			this.provider.on("block", (blockNumber) => {
				this.lastBlockTs = Date.now();
				console.log(`log: new block - ${blockNumber}`);
			});

			this.checkIntervalId = setInterval(() => {
				if (
					this.lastBlockTs &&
					this.ready &&
					this.provider.websocket &&
					(this.lastBlockTs + this.TIME_OUT) <= Date.now()
				) {
					console.log("log: need close connection (don't receive blocks)");

					clearInterval(this.checkIntervalId);
					this.checkIntervalId = null;

					this.close().then(()=> {
						this.connect();
					});
				} else {
					console.log("log: there is no reason to close the connection");
				}
			}, 8000);

			const state = store.getState();

			if (state.settings._persist && state.pools._persist) {
				// check persist
				this.onConnectCb.forEach((onConnect) => onConnect());
				this.dispatch = store.dispatch;
			} else {
				const intervalId = setInterval(() => {
					const state = store.getState();
					console.log("log: not persist");

					if (state.settings._persist && state.pools._persist) {
						console.log("log: persist and connect");

						clearInterval(intervalId);

						this.dispatch = store.dispatch;
						this.onConnectCb.forEach((onConnect) => onConnect());
					}
				}, 300);
			}
		});

		this.provider.websocket.addEventListener("close", async () => {
			console.log("log: connection was closed");

			await this.close(true);

			const waitUntilOnlineIntervalId = setInterval(() => {
				if (this.online) {
					clearInterval(waitUntilOnlineIntervalId);

					this.connect();
				}
			}, this.RECONNECT_INTERVAL);
		});
	}

	connect() {

		if (this.ready) {
			console.log("log: already ready");
			return;
		}

		if (!this.online) {
			console.log("log: offline");

			if (!this.connectingIntervalId) {
				this.connectingIntervalId = setInterval(() => {
					console.log("log: offline - let's try connect again");
					this.connect();
				}, this.RECONNECT_INTERVAL);
			}

		} else {
			this.setProvider();
		}
	}
}

export const provider = new Provider(
	appConfig.TESTNET
		? "wss://polygon-mumbai.g.alchemy.com/v2/PI-r-7wKAZDtHPTZtxtZ-5F1lTWtKJGS"
		: "wss://wevm.kava.io"
);

provider.onConnect(async () => {
	const { bootstrap } = await import("@/bootstrap");

	const timeoutCb = () => {
		const state = store.getState();

		if (state.params.inited) {
			store.dispatch(updatePrice());
		} else {
			setTimeout(timeoutCb, 500);
		}
	};

	setTimeout(timeoutCb, 500);

	provider.priceUpdateIntervalId = setInterval(() => {
		store.dispatch(updatePrice());
	}, 1000 * 60);

	bootstrap();
});

provider.onClose(() => {
	if (provider.priceUpdateIntervalId !== undefined) {
		clearInterval(provider.priceUpdateIntervalId);
	}

	store.dispatch(clearMarkets());
});

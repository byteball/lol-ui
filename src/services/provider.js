import { ethers } from "ethers";

import appConfig from "@/appConfig";

import { store } from "..";

import { updatePrice } from "@/store/thunks/updatePrice";

class Provider {
	constructor(url) {
		this.url = url;
		this.online = navigator.onLine;

		this.connect();

		window.addEventListener('online', () => this.online = true);
		window.addEventListener('offline', () => {
			this.online = false;
			this.provider.destroy();
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

	onConnect(cb) {
		this.onConnectCb.push(cb);
	}

	onClose(cb) {
		this.onCloseCb.push(cb);
	}

	setProvider() {
		this.provider = new ethers.WebSocketProvider(this.url);


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
					this.lastBlockTs + this.TIME_OUT <= Date.now()
				) {
					console.log("log: need close connection (don't receive blocks)");

					this.lastBlockTs = null;
					this.ready = false;

					clearInterval(this.checkIntervalId);
					this.checkIntervalId = null;

					this.connect();
				}
			}, 5000);

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
				}, 200);
			}
		});

		this.provider.websocket.addEventListener("close", () => {
			console.log("log: connection was closed");
			this.ready = false;
			this.onCloseCb.forEach((onClose) => onClose());

			this.connect();
		});
	}

	connect() {
		if (!this.online) {

			console.log("log: offline");

			if (!this.connectingIntervalId) {
				this.connectingIntervalId = setInterval(() => {
					this.connect();
				}, this.RECONNECT_INTERVAL);
			}

			return;
		}

		if (this.ready) {
			console.log("log: already ready");
			return;
		}

		if (this.provider) {
			// reconnect
			if (this.checkIntervalId) {
				clearInterval(this.checkIntervalId);
			}

			this.lastBlockTs = null;

			this.provider.destroy().then(() => {
				this.setProvider();
			});
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

	// store.dispatch(clearMarkets());
});

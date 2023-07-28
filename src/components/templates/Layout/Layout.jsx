import { Header } from "@/components/organisms";
import { Notifications } from "@/components/atoms";

export const Layout = ({ children }) => {
	return (
		<div>
			<div className="min-h-screen antialiased pb-20 bg-[url('/grid.svg')]">
				<div className="bg-gradient-to-b from-[#0281EB]/30 to-transparent">
					<div className="container pb-[180px] mx-auto">
						<Header />
					</div>
				</div>

				<div className="container pl-3 pr-3 mx-auto">
					<div className="mt-[-170px]">{children}</div>
				</div>
				<Notifications />
			</div>
			<div className="text-center text-white/60 mt-[-40px] pb-2 font-light">
				<div className="flex flex-wrap justify-center mb-5 space-x-5">
					<a className="p-2 hover:opacity-70" href="https://x.com/ObyteOrg" target="_blank" rel="noreferrer"><img src="/social_media/x.svg" alt="Obyte X (Twitter)" /></a>
					<a className="p-2 hover:opacity-70" href="https://t.me/obyteorg" target="_blank" rel="noreferrer"><img src="/social_media/telegram.svg" alt="Obyte telegram" /></a>
					<a className="p-2 hover:opacity-70" href="https://discord.obyte.org/" target="_blank" rel="noreferrer"><img src="/social_media/discord.svg" alt="Obyte discord" /></a>
					<a className="p-2 hover:opacity-70" href="https://blog.obyte.org/" target="_blank" rel="noreferrer"><img src="/social_media/medium.svg" alt="Obyte medium" /></a>
					<a className="p-2 hover:opacity-70" href="https://mp.weixin.qq.com/s/JB0_MlK6w--D6pO5zPHAQQ" target="_blank" rel="noreferrer"><img src="/social_media/weixin.svg" alt="Obyte weixin" /></a>
					<a className="p-2 hover:opacity-70" href="https://www.youtube.com/channel/UC59w9bmROOeUFakVvhMepPQ/" target="_blank" rel="noreferrer"><img src="/social_media/youtube.svg" alt="Obyte YouTube" /></a>
					<a className="p-2 hover:opacity-70" href="https://www.reddit.com/r/obyte/" target="_blank" rel="noreferrer"><img src="/social_media/reddit.svg" alt="Obyte reddit" /></a>
					<a className="p-2 hover:opacity-70" href="https://bitcointalk.org/index.php?topic=1608859.0" target="_blank" rel="noreferrer"><img src="/social_media/bitcointalk.svg" alt="Obyte bitcointalk" /></a>
					<a className="p-2 hover:opacity-70" href="https://www.facebook.com/obyte.org" target="_blank" rel="noreferrer"><img src="/social_media/facebook.svg" alt="Obyte facebook" /></a>
					<a className="p-2 hover:opacity-70" href="https://github.com/byteball" target="_blank" rel="noreferrer"><img src="/social_media/github.svg" alt="Obyte github" /></a>
				</div>

				<a href="https://obyte.org" target="_blank" rel="noopener">
					&copy; {new Date().getFullYear()} Obyte. All Rights Reserved.
				</a>
			</div>
		</div>
	);
};

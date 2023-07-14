import { Drawer } from "@/components/molecules";
import { StakingForm } from "@/forms";

export const StakingDrawer = ({ open, setOpen, ...meta }) => (
	<Drawer open={open} setOpen={setOpen} title={`Stake ${meta.symbol}`}>
		<StakingForm {...meta} onClose={() => setOpen(false)} />
	</Drawer>
);

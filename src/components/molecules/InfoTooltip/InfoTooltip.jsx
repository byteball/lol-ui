import Tooltip from "rc-tooltip";

import { InfoMarkIcon } from "@/components/icons";

export const InfoTooltip = ({ description, className = "" }) => {
	if (!description) return null;

	return (
		<Tooltip
			placement="top"
			trigger={["hover"]}
			overlayClassName="max-w-[250px]"
			overlay={<span>{description}</span>}
		>
			<InfoMarkIcon className={`inline opacity-60 ${className}`} />
		</Tooltip>
	);
};

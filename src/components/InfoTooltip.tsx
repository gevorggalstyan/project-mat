import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface InfoTooltipProps {
  text: string | React.ReactNode;
  style?: React.CSSProperties;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, style }) => {
  return (
    <Tooltip title={text}>
      <InfoCircleOutlined
        style={{ color: "rgba(0, 0, 0, 0.45)", marginLeft: 4, cursor: "help", ...style }}
      />
    </Tooltip>
  );
};

export default InfoTooltip;


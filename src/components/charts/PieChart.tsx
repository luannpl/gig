import React from "react";
import { View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

interface PieData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieData[];
  size?: number;
}

const PieChartCustom: React.FC<PieChartProps> = ({ data, size = 200 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  if (total === 0) return null;

  let cumulativeAngle = 0;

  return (
    <Svg width={size} height={size}>
      <G>
        {data.map((d) => {
          const sliceAngle = (d.value / total) * 2 * Math.PI;

          // coordenadas da fatia
          const x1 = cx + radius * Math.sin(cumulativeAngle);
          const y1 = cy - radius * Math.cos(cumulativeAngle);

          cumulativeAngle += sliceAngle;

          const x2 = cx + radius * Math.sin(cumulativeAngle);
          const y2 = cy - radius * Math.cos(cumulativeAngle);

          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

          const path = `
            M ${cx} ${cy}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          // posição do texto (meio da fatia)
          const midAngle = cumulativeAngle - sliceAngle / 2;
          const labelRadius = radius * 0.6;
          const labelX = cx + labelRadius * Math.sin(midAngle);
          const labelY = cy - labelRadius * Math.cos(midAngle);
          const percentage = ((d.value / total) * 100).toFixed(0);

          return (
            <G key={d.label}>
              <Path d={path} fill={d.color} />
              <SvgText
                x={labelX}
                y={labelY}
                fill="#000"
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {percentage}%
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

export default PieChartCustom;

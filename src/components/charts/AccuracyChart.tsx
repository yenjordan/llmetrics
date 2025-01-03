import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AccuracyChartProps {
  data: {
    modelName: string;
    averageAccuracy: number;
  }[];
}

export default function AccuracyChart({ data }: AccuracyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="modelName" />
        <YAxis domain={[0, 100]} />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(2)}%`, "Accuracy"]}
        />
        <Legend />
        <Bar dataKey="averageAccuracy" fill="#8884d8" name="Accuracy Score" />
      </BarChart>
    </ResponsiveContainer>
  );
}

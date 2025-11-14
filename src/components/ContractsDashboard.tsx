import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Contract } from "@/src/types/contracts";
import { BarChart } from "react-native-chart-kit"; // ChartKit para barras
import PieChartCustom from "./charts/PieChart";

interface DashboardProps {
  allContracts: Contract[] | undefined;
}

const screenWidth = Dimensions.get("window").width;

const COLORS = {
  pending: "#FF6384",
  confirmed: "#36A2EB",
  declined: "#FFCE56",
  canceled: "#4BC0C0",
  text: "#333",
  grid: "#eee",
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
  labelColor: () => COLORS.text,
  propsForBackgroundLines: {
    stroke: COLORS.grid,
  },
};

const ContractsDashboard: React.FC<DashboardProps> = ({ allContracts }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const {
    totalRevenue,
    pendingContracts,
    upcomingEvents,
    pieChartData,
    nextTwoEvents,
    barChartData,
  } = useMemo(() => {
    if (!allContracts || allContracts.length === 0) {
      return {
        totalRevenue: 0,
        pendingContracts: 0,
        upcomingEvents: 0,
        pieChartData: [] as { label: string; value: number; color: string }[],
        nextTwoEvents: [] as Contract[],
        barChartData: { labels: [], datasets: [{ data: [] }] },
      };
    }

    const now = new Date();
    const confirmedContracts = allContracts.filter(
      (c) => c.status === "confirmed"
    );

    const totalRevenue = confirmedContracts.reduce(
      (sum, c) => sum + Number(c.budget || 0),
      0
    );

    const pendingContracts = allContracts.filter(
      (c) => c.status === "pending"
    ).length;
    const upcomingEvents = confirmedContracts.filter(
      (c) => new Date(c.eventDate) > now
    ).length;

    const statusCounts: Record<string, number> = {};
    allContracts.forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    const pieChartData = [
      {
        label: "Pendentes",
        value: statusCounts.pending || 0,
        color: COLORS.pending,
      },
      {
        label: "Aceitos",
        value: statusCounts.confirmed || 0,
        color: COLORS.confirmed,
      },
      {
        label: "Recusados",
        value: statusCounts.declined || 0,
        color: COLORS.declined,
      },
      {
        label: "Cancelados",
        value: statusCounts.canceled || 0,
        color: COLORS.canceled,
      },
    ].filter((d) => d.value > 0);

    const nextTwoEvents = confirmedContracts
      .filter((c) => new Date(c.eventDate) > now)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      )
      .slice(0, 2);

    // --- Bar chart mensal ---
    const monthlyRevenue: number[] = Array(12).fill(0);
    confirmedContracts.forEach((c) => {
      const month = new Date(c.eventDate).getMonth();
      const value = Number(c.budget); // garante número
      monthlyRevenue[month] += isNaN(value) ? 0 : value; // evita NaN
    });

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const barChartData = {
      labels: monthNames,
      datasets: [{ data: monthlyRevenue }],
    };

    return {
      totalRevenue,
      pendingContracts,
      upcomingEvents,
      pieChartData,
      nextTwoEvents,
      barChartData,
    };
  }, [allContracts]);

  if (!allContracts || allContracts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Sem dados para exibir no dashboard.
        </Text>
      </View>
    );
  }

  // Configuração de largura do gráfico de barras com rolagem horizontal
  const monthsCount = barChartData.labels.length;
  const perMonthWidth = isDesktop ? 80 : 60; // largura desejada por mês (desktop maior)
  const extraPadding = 40; // espaço adicional interno
  // largura real do canvas do gráfico; se ficar menor que a largura visível do card, a rolagem não aparece
  const barChartScrollableWidth = monthsCount * perMonthWidth + extraPadding;
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* --- KPIs --- */}
      <View style={[styles.kpiWrapper, isDesktop && styles.kpiRow]}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {totalRevenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Text>
          <Text style={styles.kpiLabel}>Receita Total</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{pendingContracts}</Text>
          <Text style={styles.kpiLabel}>Contratos Pendentes</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{upcomingEvents}</Text>
          <Text style={styles.kpiLabel}>Eventos Próximos</Text>
        </View>
      </View>

      {isDesktop ? (
        <View style={styles.chartsRow}>
          {pieChartData.length > 0 && (
            <View style={[styles.chartContainer, styles.chartBox]}>
              <Text style={styles.chartTitle}>Status dos Contratos</Text>
              <PieChartCustom data={pieChartData} size={200} />
              <View style={styles.legendContainer}>
                {pieChartData.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColorBox,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text
                      style={styles.legendText}
                    >{`${item.label} (${item.value})`}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={[styles.chartContainerBar, styles.chartBox]}>
            <Text style={styles.chartTitle}>Receita por Mês</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              style={{ width: "100%" }}
            >
              <BarChart
                data={barChartData}
                width={barChartScrollableWidth}
                height={250}
                chartConfig={chartConfig}
                fromZero
                yAxisLabel="R$"
                yAxisSuffix=""
                showValuesOnTopOfBars
              />
            </ScrollView>
          </View>
        </View>
      ) : (
        <>
          {/* --- Gráfico de Pizza --- */}
          {pieChartData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Status dos Contratos</Text>
              <PieChartCustom data={pieChartData} size={200} />
              <View style={styles.legendContainer}>
                {pieChartData.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColorBox,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text
                      style={styles.legendText}
                    >{`${item.label} (${item.value})`}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* --- Gráfico de Barras --- */}
          <View style={styles.chartContainerBar}>
            <Text style={styles.chartTitle}>Receita por Mês</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              style={{ width: "100%" }}
            >
              <BarChart
                data={barChartData}
                width={barChartScrollableWidth}
                height={250}
                chartConfig={chartConfig}
                fromZero
                yAxisLabel="R$"
                yAxisSuffix=""
                showValuesOnTopOfBars
              />
            </ScrollView>
          </View>
        </>
      )}

      {/* --- Próximos 2 eventos --- */}
      {nextTwoEvents.length > 0 && (
        <View style={[styles.chartContainer, styles.leftAlign]}>
          <Text style={styles.chartTitle}>Próximos Eventos</Text>
          {nextTwoEvents.map((c) => (
            <View key={c.id} style={{ marginBottom: 10 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}
              >
                {c.eventName}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>
                {new Date(c.eventDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Orçamento:{" "}
                {c.budget?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 15, paddingBottom: 24, backgroundColor: "#f2f2f2" },
  kpiWrapper: { marginBottom: 20 },
  kpiRow: { flexDirection: "row" },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  kpiValue: { fontSize: 20, fontWeight: "bold", color: "#000" },
  kpiLabel: { fontSize: 12, color: "#666", marginTop: 5 },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chartContainerBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    alignItems: "flex-start",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    // removido overflow hidden para não limitar gestos de rolagem em algumas plataformas
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  legendContainer: {
    marginTop: 15,
    width: "100%",
    paddingHorizontal: 10,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 5,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.text,
  },
  chartsRow: {
    flexDirection: "row",
    gap: 10,
  },
  chartBox: {
    flex: 1,
  },
  leftAlign: {
    alignItems: "flex-start",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
});

export default ContractsDashboard;

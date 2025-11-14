import React, { useMemo, useState, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarProvider,
  ExpandableCalendar,
  AgendaList,
  WeekCalendar,
} from "react-native-calendars";
import ContractsList from "@/src/components/ContractsList";
import type XDate from "xdate";
import { AntDesign } from "@expo/vector-icons";
import { Contract } from "@/src/types/contracts";
import api from "@/src/services/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ContractsCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [weekView, setWeekView] = useState<boolean>(true);
  const calendarRef = useRef<{
    toggleCalendarPosition: () => boolean;
    addMonth?: (n: number) => void;
  }>(null);

  // ===== Fetch perfil e contratos para marcar dias com eventos confirmados =====
  type Profile = {
    id: string;
    band: { id: number } | null;
    venue: { id: string } | null;
  };

  const { data: me } = useQuery<Profile>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });

  const userInfo = useMemo(() => {
    if (!me) return null;
    if (me.band)
      return {
        id: me.band.id,
        type: "band",
        endpoint: `/contract/band/${me.band.id}`,
      };
    if (me.venue)
      return {
        id: me.venue.id,
        type: "venue",
        endpoint: `/contract/venue/${me.venue.id}`,
      };
    return null;
  }, [me]);

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["contracts", userInfo?.id, userInfo?.type],
    queryFn: async () => {
      if (!userInfo) throw new Error("Usuário não encontrado");
      const { data } = await api.get<Contract[]>(userInfo.endpoint);
      return data;
    },
    enabled: !!userInfo,
  });

  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const firstPart = dateStr.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(firstPart)) return firstPart;
    return dateStr.slice(0, 10);
  };

  const eventDatesSet = useMemo(() => {
    const set = new Set<string>();
    (contracts || [])
      .filter((c) => c.status === "confirmed")
      .forEach((c) => set.add(normalizeDate(c.eventDate)));
    return set;
  }, [contracts]);

  const markedDates = useMemo(() => {
    const md: Record<string, any> = {};
    eventDatesSet.forEach((d) => {
      md[d] = { ...(md[d] || {}), marked: true, dotColor: "#000" };
    });
    // Merge seleção para não perder o ponto
    md[selectedDate] = {
      ...(md[selectedDate] || {}),
      selected: true,
      selectedColor: "#bfdbfe", // azul claro para bom contraste com o ponto preto
    };
    return md;
  }, [eventDatesSet, selectedDate]);

  const handleDayPress = useCallback((day: any) => {
    if (day?.dateString) setSelectedDate(day.dateString);
  }, []);

  // Helpers locais para evitar bug de fuso (new Date('YYYY-MM-DD') usa UTC e pode voltar 1 dia)
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const parseYMD = (base: string) => {
    const [y, m, day] = base.split("-").map(Number);
    return new Date(y, (m || 1) - 1, day || 1);
  };
  const shiftDate = (base: string, days: number) => {
    const d = parseYMD(base);
    d.setDate(d.getDate() + days);
    return formatYMD(d);
  };
  const shiftMonth = (base: string, months: number) => {
    const d = parseYMD(base);
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    return formatYMD(d);
  };

  const renderHeader = useCallback(
    (date?: XDate) => {
      const label =
        date?.toString("MMMM yyyy") ??
        new Date(selectedDate).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
      return (
        <View style={styles.headerWrap}>
          {weekView && (
            <TouchableOpacity
              style={styles.arrowBtn}
              onPress={() => {
                if (weekView) {
                  setSelectedDate((prev) => shiftDate(prev, -7));
                } else {
                  calendarRef.current?.addMonth?.(-1);
                  setSelectedDate((prev) => shiftMonth(prev, -1));
                }
              }}
              activeOpacity={0.7}
            >
              <AntDesign name="left" size={16} color="#111" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{label}</Text>
          {weekView && (
            <TouchableOpacity
              style={styles.arrowBtn}
              onPress={() => {
                if (weekView) {
                  setSelectedDate((prev) => shiftDate(prev, 7));
                } else {
                  calendarRef.current?.addMonth?.(1);
                  setSelectedDate((prev) => shiftMonth(prev, 1));
                }
              }}
              activeOpacity={0.7}
            >
              <AntDesign name="right" size={16} color="#111" />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [selectedDate, weekView]
  );

  return (
    <View style={styles.container}>
      <CalendarProvider
        date={selectedDate}
        onDateChanged={(date: string) => setSelectedDate(date)}
      >
        {weekView ? (
          <>
            {renderHeader()}
            <WeekCalendar
              firstDay={1}
              current={selectedDate}
              markedDates={markedDates}
              markingType={"dot"}
              onDayPress={handleDayPress}
              allowShadow
              style={styles.calendar}
              theme={{
                selectedDayBackgroundColor: "#bfdbfe",
                selectedDayTextColor: "#111",
                todayTextColor: "#000",
              }}
            />
          </>
        ) : (
          <ExpandableCalendar
            ref={calendarRef}
            renderHeader={renderHeader}
            firstDay={1}
            markedDates={markedDates}
            markingType={"dot"}
            onDayPress={handleDayPress}
            initialPosition={ExpandableCalendar.positions.CLOSED}
            hideKnob={false}
            disableWeekScroll={false}
            disablePan={false}
            enableSwipeMonths={true}
            hideArrows={true}
            allowShadow
            calendarStyle={styles.calendar}
            theme={{
              selectedDayBackgroundColor: "#bfdbfe",
              selectedDayTextColor: "#111",
              todayTextColor: "#000",
            }}
          />
        )}
        <TouchableOpacity
          style={styles.viewToggleBar}
          activeOpacity={0.6}
          onPress={() => setWeekView((prev) => !prev)}
        />
        <AgendaList
          sections={[{ title: selectedDate, data: [{ key: "list" }] }]}
          renderItem={() => <ContractsList selectedDate={selectedDate} />}
          sectionStyle={styles.section}
        />
      </CalendarProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  calendar: {
    zIndex: 2,
    elevation: 2,
    marginBottom: 4,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
    color: "#111",
  },
  arrowBtn: {
    padding: 8,
    borderRadius: 20,
  },
  section: {
    color: "#6b7280",
    textTransform: "capitalize",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  viewToggleBar: {
    alignSelf: "center",
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
    marginVertical: 8,
  },
});

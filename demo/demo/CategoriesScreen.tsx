demo/CategoriesScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Category = {
  id: string;
  name: string;
  image?: string | null;
};

const Colors = {
  primary: "#2E5BFF",
  secondary: "#19D3AE",
  white: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  bg: "#F5F5F5",
};

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const NUM_COLUMNS = isTablet ? 3 : 2;
const CARD_GAP = 16;
const CARD_WIDTH = (width - (NUM_COLUMNS + 1) * CARD_GAP) / NUM_COLUMNS;

const FAKE_CATEGORIES: Category[] = [
  { id: "1", name: "Baharatlar" },
  { id: "2", name: "Şifalı Bitkiler" },
  { id: "3", name: "Çaylar" },
  { id: "4", name: "Yağlar" },
  { id: "5", name: "Sirkeler" },
];

type Props = {
  onCategorySelect?: (category: Category) => void;
};

export default function CategoriesScreen({ onCategorySelect }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Showcase: gerçek projede burada offline DB + sync akışı var.
      // Burada sadece "yükleniyor / sync" deneyimini göstermeyi amaçlıyoruz.
      setSyncing(true);
      await wait(650);
      setSyncing(false);

      setCategories(FAKE_CATEGORIES);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await wait(600);
      setCategories(FAKE_CATEGORIES);
    } finally {
      setRefreshing(false);
    }
  };

  const title = useMemo(() => {
    return isTablet ? "Digital Catalog (Tablet)" : "Digital Catalog";
  }, []);

  const renderCategory = ({ item }: { item: Category }) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => onCategorySelect?.(item)}
      >
        <View style={styles.imageSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientPlaceholder}
          >
            <Ionicons name="grid" size={54} color={Colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.viewButton}>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading || syncing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {syncing ? "Veriler hazırlanıyor..." : "Yükleniyor..."}
        </Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <Header title={title} onSearch={() => setShowSearch(true)} />

        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Kategori bulunamadı</Text>

          <Pressable style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </Pressable>
        </View>

        <SearchPlaceholder visible={showSearch} onClose={() => setShowSearch(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={title} onSearch={() => setShowSearch(true)} />

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        key={`grid-${NUM_COLUMNS}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />

      <SearchPlaceholder visible={showSearch} onClose={() => setShowSearch(false)} />
    </View>
  );
}

function Header({ title, onSearch }: { title: string; onSearch: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Ürün Kataloğu</Text>
        </View>

        <Pressable style={styles.searchIconButton} onPress={onSearch}>
          <Ionicons name="search" size={28} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

function SearchPlaceholder({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (visible) {
      Alert.alert(
        "Global Search (Showcase)",
        "Gerçek projede burada global arama modalı bulunuyor. Showcase repoda private bağımlılıklar çıkarıldı.",
        [{ text: "Tamam", onPress: onClose }]
      );
    }
  }, [visible, onClose]);

  return null;
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bg,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: Colors.textLight },

  header: { backgroundColor: Colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: Colors.white },
  subtitle: { fontSize: 16, color: Colors.white, opacity: 0.9, marginTop: 2 },

  searchIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  list: { padding: 20, alignItems: "center" },

  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    marginHorizontal: CARD_GAP / 2,
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  imageSection: { height: CARD_WIDTH * 0.75, backgroundColor: Colors.primary },
  gradientPlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },

  infoSection: { flex: 1, padding: 16, justifyContent: "space-between", alignItems: "center" },
  categoryName: { fontSize: 14, fontWeight: "800", color: Colors.text, textAlign: "center", lineHeight: 18 },

  viewButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, color: Colors.textMuted, textAlign: "center" },
  refreshButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 8 },
  refreshButtonText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
});

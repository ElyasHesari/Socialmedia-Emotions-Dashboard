<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9">
        <v-card>
          <v-card-title>Emotion Dashboard</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <canvas ref="barChartRef" height="300"></canvas>
              </v-col>
              <v-col cols="6">
                <canvas ref="pieChartRef" height="300"></canvas>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card>
          <v-card-title>Filters</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedEmotion"
              :items="emotions"
              label="Select Emotion"
            ></v-select>

            <v-select
              v-model="selectedGender"
              :items="['all', 'male', 'female']"
              label="Gender"
            ></v-select>

            <v-select
              v-model="selectedAge"
              :items="['all', '<18', '19-29', '30-39', '>40']"
              label="Age Group"
            ></v-select>

            <v-select
              v-model="selectedLocation"
              :items="['all', 'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana']"
              label="Location"
            ></v-select>

            <v-btn @click="fetchData" color="primary">Apply Filters</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay :model-value="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </v-overlay>

    <v-snackbar v-model="showErrorMessage" color="error">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn @click="showErrorMessage = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, inject } from "vue";
import chartPlugin from "chart.js/auto";

// Inject axios and Chart from plugins
const axios = inject("axios");
const Chart = inject("$chart");

// Refs for chart elements
const barChartRef = ref(null);
const pieChartRef = ref(null);

// Chart instances
const barChart = ref(null);
const pieChart = ref(null);

// Filter states
const selectedEmotion = ref("emotions_happiness");
const selectedGender = ref("all");
const selectedAge = ref("all");
const selectedLocation = ref("all");

// UI states
const loading = ref(false);
const showErrorMessage = ref(false);
const errorMessage = ref("");

// Emotion types
const emotions = Object.keys({
  emotions_anger: "",
  emotions_happiness: "",
  emotions_sadness: "",
  emotions_fear: "",
  emotions_surprise: "",
});

// Fetch and process data
const fetchData = async () => {
  loading.value = true;
  showErrorMessage.value = false;

  try {
    const response = await axios.get("/emotions", {
      params: {
        start_date: "2024/01",
        end_date: "2024/03",
        filter: {
          gender: selectedGender.value,
          age: selectedAge.value,
          location: selectedLocation.value,
        },
      },
    });

    updateCharts(response.data.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    errorMessage.value = "Failed to fetch data. Please try again.";
    showErrorMessage.value = true;
  } finally {
    loading.value = false;
  }
};

const updateCharts = (data) => {
  // Destroy existing charts
  if (barChart.value) barChart.value.destroy();
  if (pieChart.value) pieChart.value.destroy();

  // Bar Chart: Monthly emotion trend
  barChart.value = new Chart(barChartRef.value, {
    type: "bar",
    data: {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: selectedEmotion.value,
          data: data.map((item) => item.emotions[selectedEmotion.value] || 0),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: "Emotion Intensity",
          },
        },
      },
    },
  });

  // Pie Chart: Emotion distribution across locations
  const locationNames = ["Istanbul", "Ankara", "Izmir", "Bursa", "Adana"];
  const locationEmotionValues = locationNames.map((location) => {
    return data.reduce((sum, item) => {
      return item.location === location
        ? sum + (item.emotions[selectedEmotion.value] || 0)
        : sum;
    }, 0);
  });

  pieChart.value = new Chart(pieChartRef.value, {
    type: "pie",
    data: {
      labels: locationNames,
      datasets: [
        {
          data: locationEmotionValues,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
};

// Watch for filter changes
watch([selectedEmotion, selectedGender, selectedAge, selectedLocation], () => {
  fetchData();
});

// Initial data fetch
onMounted(fetchData);
</script>

<template>
  <div class="container">
    <q-page class="q-pa-lg">
      <q-select
        v-model="selectedPort"
        :options="ports"
        option-label="path"
        option-value="path"
        label="Select Serial Port"
      />

      <q-form @submit.prevent="sendMessage">
        <q-input
          v-model="message"
          label="Message"
          type="textarea"
          maxlength="140"
        >
          <!-- <template v-slot:after>
            <div class="text-right q-mt-sm">
              <span>{{ remainingCharacters }} characters remaining</span>
            </div>
          </template> -->
        </q-input>
        <div class="text-right q-mt-sm q-mb-sm text-body2">
          <span>{{ remainingCharacters }} characters remaining</span>
        </div>
        <q-file
          ref="fileInput"
          label="Upload Numbers File (.txt)"
          filled
          v-model="file"
          bottom-slots
          @input="handleFileUpload"
        >
        </q-file>
        <q-btn
          :class="$q.screen.gt.sm ? '' : 'full-width'"
          color="primary"
          icon="send"
          label="Send"
          @click="sendMessage"
          :disable="!file || !selectedPort || !message"
        />
      </q-form>
    </q-page>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { api } from "src/boot/axios";

const $q = useQuasar();
const ports = ref([]);
const selectedPort = ref(null);
const message = ref("");
const file = ref(null);
const numbers = ref([]);

// Computed property for remaining characters
const remainingCharacters = computed(() => {
  return 140 - message.value.length;
});

const handleFileUpload = (event) => {
  const input = event.target;
  if (input.files && input.files.length > 0) {
    const selectedFile = input.files[0]; // Get the first file
    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result;
      // Parse the file content
      numbers.value = fileContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")); // Remove empty lines and comments
      console.log("Numbers:", numbers.value); // Log the numbers
    };

    reader.onerror = (error) => {
      console.error("Error reading file", error);
    };

    reader.readAsText(selectedFile);
  } else {
    console.error("No file selected or file list is empty.");
  }
};

const sendMessage = async () => {
  if (selectedPort.value && numbers.value.length > 0) {
    await api
      .post(
        "/api/send-message",
        {
          port: { path: selectedPort.value },
          message: message.value,
          numbers: numbers.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data.message);
          $q.notify({
            type: "positive",
            message: "Messages Sent!",
          });
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .catch((error) => {
        console.error("Error connecting to port:", error);
        $q.notify({ type: "negative", message: "Messages were not sent!" });
      });
  } else {
    $q.notify({
      type: "negative",
      message: "Please select a port and upload a file first!",
    });
  }
};

const fetchPorts = async () => {
  try {
    const response = await api.get("/api/serial-ports");
    ports.value = response.data;
  } catch (error) {
    console.error("Error fetching ports:", error);
    $q.notify({ type: "negative", message: "Failed to fetch ports" });
  }
};

onMounted(() => {
  fetchPorts();
});
</script>

<style scoped>
.container {
  padding: 1rem;
}
</style>

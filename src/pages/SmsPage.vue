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
      <!-- <q-btn label="Connect" @click="connectPort" /> -->

      <q-form @submit.prevent="sendMessage">
        <!-- <q-input v-model="templateName" label="Template Name" /> -->
        <q-input v-model="message" label="Message" type="textarea" />
        <q-btn label="Send Message" type="submit" />
      </q-form>
      <!-- Display a message if no templates are available -->
      <p v-if="templates.length === 0">No templates available.</p>

      <!-- Debugging output to verify the data -->
      <!-- <pre v-if="templates.length > 0">{{ templates }}</pre> -->
      <!-- q-table configuration -->
      <!-- <q-table
        :rows="templates"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
      /> -->
    </q-page>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();
const ports = ref([]);
const selectedPort = ref(null);
const templateName = ref("");
const message = ref("");
const templates = ref([]);
const columns = ref([
  {
    name: "template_name",
    label: "Template Name",
    align: "left",
    field: (row) => row.template_name,
  },
  {
    name: "message",
    label: "Message",
    align: "left",
    field: (row) => row.message,
  },
]);
const pagination = ref({ page: 1, rowsPerPage: 10 });

const sendMessage = async () => {
  if (selectedPort.value) {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/send-message",
        {
          port: { path: selectedPort.value },
        }
      );

      if (response.status === 200) {
        console.log(response.data.message);
        $q.notify({
          type: "positive",
          message: "Message Sent!",
        });
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error connecting to port:", error);
      $q.notify({ type: "negative", message: "Message was not sent!" });
    }
  } else {
    $q.notify({ type: "negative", message: "Please select a port first!" });
  }
};

const fetchPorts = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/serial-ports");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    ports.value = await response.json();
  } catch (error) {
    console.error("Error fetching ports:", error);
    $q.notify({ type: "negative", message: "Failed to fetch ports" });
  }
};

const fetchTemplates = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/sms-templates");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    templates.value = await response.json();
  } catch (error) {
    console.error("Error fetching templates:", error);
    $q.notify({ type: "negative", message: "Failed to fetch templates" });
  }
};

const connectPort = async () => {
  if (selectedPort.value) {
    try {
      const response = await fetch("http://localhost:3000/api/connect-port", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: { path: selectedPort.value } }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data.message);
      $q.notify({
        type: "positive",
        message: "Connected to port " + selectedPort.value,
      });
    } catch (error) {
      console.error("Error connecting to port:", error);
      $q.notify({ type: "negative", message: "Failed to connect to port" });
    }
  } else {
    $q.notify({ type: "negative", message: "Please select a port first!" });
  }
};

const saveTemplate = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/sms-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_name: templateName.value,
        message: message.value,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    templateName.value = "";
    message.value = "";
    fetchTemplates();
  } catch (error) {
    console.error("Error saving template:", error);
    $q.notify({ type: "negative", message: "Failed to save template" });
  }
};

onMounted(() => {
  fetchPorts();
  fetchTemplates();
});
</script>

<style scoped>
.container {
  padding: 1rem;
}
</style>

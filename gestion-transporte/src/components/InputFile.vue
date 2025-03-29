<template>
    <CustomButton class="upload-photo-button" color="light" @click="triggerFileInput">
      <slot></slot>
    </CustomButton>
    <input 
      type="file" 
      :accept="accept" 
      ref="fileInput" 
      style="display:none" 
      @change="handleFileUpload" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import CustomButton from "@/components/CustomButton.vue";
import { uploadFile } from "@/services/api";

defineProps({
    accept: {
        type: String,
        default: "image/*" // para aceptar pdfs, llamar al componente con propiedad accept="application/pdf"
    }
})

const fileInput = ref<HTMLInputElement | null>(null);

const emitFileUrl = defineEmits<{
  (e: 'file-uploaded', url: string): void;
}>();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const fileInputElement = event.target as HTMLInputElement;
  const file = fileInputElement?.files?.[0];

  if (file) {
    try {
      const uploadedUrl = await uploadFile(file);
      console.log('Archivo subido:', uploadedUrl);
      emitFileUrl('file-uploaded', uploadedUrl);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  }
};
</script>
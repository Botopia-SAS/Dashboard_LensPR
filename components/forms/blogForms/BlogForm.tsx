"use client";
import React, { useState, useEffect } from "react";
import { FormDataBlog, LanguageDataBlog, BlogLanguageKey, emptyBlogFormData } from "../../../types/blogs";
import { ClientData } from "../../../types/clients";
import SocialLinksForm from "./SocialLinksForm";

// Componentes modulares
import LanguageSelector from "./LanguageSelector";
import GeneralSettings from "./GeneralSettings";
import ContentEditor from "./ContentEditor";
import SEOSettings from "./SEOSettings";
import ImageUploader from "./ImageUploader";
import AdditionalSettings from "./AdditionalSettings";
import FormValidation from "./FormValidation";
import ActionButtons from "./ActionButtons";

// Hook personalizado para traducción de blogs (Google Translate API)
import { useBlogTranslation } from "./hooks/useBlogTranslation";

interface BlogFormProps {
  initialData?: FormDataBlog;
  onSubmit?: (data: FormDataBlog, isEdit: boolean) => void;
  defaultLanguage?: BlogLanguageKey;
}

const BlogForm: React.FC<BlogFormProps> = ({
  initialData,
  onSubmit,
  defaultLanguage = "Español"
}) => {
  // Estados principales
  const [selectedLanguage, setSelectedLanguage] = useState<BlogLanguageKey>(defaultLanguage);
  const [formData, setFormData] = useState<FormDataBlog>(() => {
    if (initialData) {
      // Asegurar que initialData tiene todos los campos requeridos
      const safeInitialData: FormDataBlog = {
        ...emptyBlogFormData,
        ...initialData,
        Español: { ...emptyBlogFormData.Español, ...initialData.Español },
        Inglés: { ...emptyBlogFormData.Inglés, ...initialData.Inglés },
        Portugués: { ...emptyBlogFormData.Portugués, ...initialData.Portugués }
      };
      return safeInitialData;
    }
    return emptyBlogFormData;
  });
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Hook de traducción específico para blogs
  const { isTranslating, translationError, translateContent } = useBlogTranslation();

  // Inicialización
  useEffect(() => {
    if (initialData) {
      const safeInitialData: FormDataBlog = {
        ...emptyBlogFormData,
        ...initialData,
        Español: { ...emptyBlogFormData.Español, ...initialData.Español },
        Inglés: { ...emptyBlogFormData.Inglés, ...initialData.Inglés },
        Portugués: { ...emptyBlogFormData.Portugués, ...initialData.Portugués }
      };
      setFormData(safeInitialData);
    }
  }, [initialData]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients/getClients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error("Error obteniendo clientes", e);
    } finally {
      setLoadingClients(false);
    }
  };

  // Handlers de cambios
  const handleLanguageFieldChange = (
    lang: BlogLanguageKey,
    field: keyof LanguageDataBlog,
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  const handleGeneralChange = (field: keyof FormDataBlog, value: string | boolean | number | undefined | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Upload de imágenes
  const handleUploadCover = async (file: File) => {
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, cover_image_url: url }));
    }
  };

  const handleUploadOG = async (file: File) => {
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, og_image_url: url }));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: fd }
      );

      const data = await response.json();
      return data.secure_url || null;
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      return null;
    }
  };

  // Validación del formulario
  const isFormValid = (): boolean => {
    if (!formData.slug?.trim() || !formData.cover_image_url) return false;

    for (const lang of ["Español", "Inglés", "Portugués"] as const) {
      const data = formData[lang];
      if (!data?.title?.trim() || !data?.excerpt?.trim() ||
          !data?.content?.trim() || !data?.category?.trim()) {
        return false;
      }
    }

    return true;
  };

  // Handlers de acciones
  const handleTranslate = async (sourceLang: BlogLanguageKey) => {
    const updatedData = await translateContent(formData, sourceLang);
    setFormData(updatedData);
  };

  const handleSubmit = () => {
    const isEdit = !!initialData;
    onSubmit?.(formData, isEdit);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-none mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Mensaje de error de traducción */}
          {translationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error de traducción</h3>
                  <p className="mt-1 text-sm text-red-700">{translationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selector de idioma */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />

          {/* Configuración general */}
          <GeneralSettings
            slug={formData.slug}
            canonicalUrl={formData.canonical_url}
            onSlugChange={(slug) => handleGeneralChange("slug", slug)}
            onCanonicalUrlChange={(url) => handleGeneralChange("canonical_url", url)}
          />

          {/* Editor de contenido principal */}
          <ContentEditor
            selectedLanguage={selectedLanguage}
            languageData={formData[selectedLanguage]}
            onFieldChange={(field, value) =>
              handleLanguageFieldChange(selectedLanguage, field, value)
            }
          />

          {/* Grid para SEO y Enlaces Sociales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SEOSettings
              selectedLanguage={selectedLanguage}
              metaTitle={formData[selectedLanguage].metaTitle}
              metaDescription={formData[selectedLanguage].metaDescription}
              onMetaTitleChange={(metaTitle) =>
                handleLanguageFieldChange(selectedLanguage, "metaTitle", metaTitle)
              }
              onMetaDescriptionChange={(metaDescription) =>
                handleLanguageFieldChange(selectedLanguage, "metaDescription", metaDescription)
              }
            />

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <SocialLinksForm
                value={formData.social_links}
                onChange={(val) => handleGeneralChange("social_links", val)}
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImageUploader
                title="Imagen de portada"
                imageUrl={formData.cover_image_url}
                onImageUpload={handleUploadCover}
                required
              />
              <ImageUploader
                title="Imagen OG"
                subtitle="Para redes sociales (Facebook, Twitter, etc.)"
                imageUrl={formData.og_image_url}
                onImageUpload={handleUploadOG}
              />
            </div>
          </div>

          {/* Configuración adicional */}
          <AdditionalSettings
            clients={clients}
            loadingClients={loadingClients}
            clientId={formData.client_id}
            published={formData.published}
            orderNumber={formData.order_number}
            onClientIdChange={(clientId) => handleGeneralChange("client_id", clientId)}
            onPublishedChange={(published) => handleGeneralChange("published", published)}
            onOrderNumberChange={(orderNumber) => handleGeneralChange("order_number", orderNumber)}
          />

          {/* Validación */}
          <FormValidation isValid={isFormValid()} />

          {/* Botones de acción */}
          <ActionButtons
            selectedLanguage={selectedLanguage}
            isTranslating={isTranslating}
            isFormValid={isFormValid()}
            isEdit={!!initialData}
            onTranslate={handleTranslate}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogForm;
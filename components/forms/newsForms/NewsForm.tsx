import FormComponent from "../FormComponent";

const NewsForm = () => {
  return (
    <FormComponent
      title="Noticia"
      apiEndpoint="/api/addNews"
      fields={[
        { name: "title", type: "text", placeholder: "Título" },
        { name: "description", type: "text", placeholder: "Descripción" },
        { name: "editorial", type: "text", placeholder: "Editorial" },
      ]}
    />
  );
};

export default NewsForm;

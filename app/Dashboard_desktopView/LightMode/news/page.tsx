import NewsForm from "@/components/forms/newsForms/NewsForm";

const NewsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Publicar Noticias</h1>
      <NewsForm />
    </div>
  );
};

export default NewsPage;

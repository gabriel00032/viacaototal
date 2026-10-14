import AdminEditor from "@/components/AdminEditor";
export default function Page() { return (<><h1 className="text-xl font-black text-navy mb-4">Conteúdo do site</h1><AdminEditor campo="hero" campos={["hero", "minis", "difcards", "cta", "quemsomos"]} /></>); }

import ButtonDaisy from "@/components/buttons/button-daisy";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";

export default function Home() {
  return (
    <LayoutTailwind title="Dashboard">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <ButtonDaisy text="Test" />
    </LayoutTailwind>
  );
}

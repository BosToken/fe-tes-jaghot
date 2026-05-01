type LayoutProps = {
  children: React.ReactNode;
  title: string;
};

import SidebarDaisy from "@/components/sidebars/sidebar-daisy";

export default function DashboardLayoutTailwind({ children, title }: LayoutProps) {
  return (
        <SidebarDaisy title={title}> 
            <div className="mx-8 mt-8">
                {children}
            </div>
        </SidebarDaisy>
    );
}

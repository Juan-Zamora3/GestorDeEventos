import type { FC } from "react";
import { Outlet } from "react-router-dom";

export const PaginaDesengloseEventoAdminEventos: FC = () => {

  return (
    <div className="h-full  px-1 md:px-1 py-1 md:py-1 overflow-hidden">
      <div className="h-full w-[99%] mx-auto bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PaginaDesengloseEventoAdminEventos;

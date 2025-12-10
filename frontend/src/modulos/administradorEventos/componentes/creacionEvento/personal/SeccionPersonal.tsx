// src/modulos/administradorEventos/componentes/creacionEvento/SeccionPersonal.tsx

import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import FooterAdminEventos from "../../comunes/FooterAdminEventos";
import ModalRolPersonal from "./ModalRolPersonal";
import ModalCampoEvento from "../ModalCampoEvento";

import {
  camposBasePersonal,
  camposExtraPersonal,
} from "../../../../../api/eventosAdminEventosApi";
import type {
  CampoEvento,
  RolPersonalConfig,
} from "../../../../../api/adminEventosApi";
import type { CrearEventoOutletContext } from "../../../paginas/PaginaCrearEventoAdminEventos";

type RolUI = RolPersonalConfig & { activo?: boolean };

const SeccionPersonal: FC = () => {
  const navigate = useNavigate();
  const { personal, setPersonal, setSlideDir } =
    useOutletContext<CrearEventoOutletContext>();

  const roles = personal.roles as RolUI[];
  const camposPorRol = personal.camposPorRol;

  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(() =>
    roles.find((r) => r.activo)?.id ?? roles[0]?.id,
  );

  const [campoSeleccionadoId, setCampoSeleccionadoId] = useState<
    string | undefined
  >(undefined);

  // Modal rol
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalModo, setModalModo] = useState<"crear" | "editar">("crear");
  const [rolEditando, setRolEditando] = useState<RolPersonalConfig | undefined>(
    undefined,
  );

  // Modal campo
  const [modalCampoAbierto, setModalCampoAbierto] =
    useState<boolean>(false);
  const [modalCampoModo, setModalCampoModo] = useState<
    "crear" | "editar"
  >("crear");
  const [campoEditando, setCampoEditando] = useState<
    CampoEvento | undefined
  >(undefined);

  const toggleRol = (id: string) => {
    setPersonal((prev) => ({
      ...prev,
      roles: prev.roles.map((r) =>
        r.id === id ? { ...r, activo: !r.activo } : r,
      ),
    }));
  };

  useEffect(() => {
    if (!selectedRoleId || !roles.some((r) => r.id === selectedRoleId)) {
      const siguiente = roles.find((r) => r.activo)?.id ?? roles[0]?.id;
      setSelectedRoleId(siguiente);
      setCampoSeleccionadoId(undefined);
    }
  }, [roles, selectedRoleId]);

  const seleccionarRol = (id: string) => {
    setSelectedRoleId(id);
    setCampoSeleccionadoId(undefined);
  };

  const abrirCrear = () => {
    setModalModo("crear");
    setRolEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (rol: RolPersonalConfig) => {
    setModalModo("editar");
    setRolEditando(rol);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const generarId = () => `rol-${Math.random().toString(36).slice(2, 8)}`;
  const generarCampoId = () =>
    `campo-${Math.random().toString(36).slice(2, 8)}`;

  const manejarGuardar = (data: RolPersonalConfig) => {
    if (modalModo === "crear") {
      const nuevo: RolUI = {
        id: generarId(),
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: true,
      };
      setPersonal((prev) => ({
        ...prev,
        roles: [...prev.roles, nuevo],
        camposPorRol: {
          ...prev.camposPorRol,
          [nuevo.id]: [...camposBasePersonal, ...camposExtraPersonal],
        },
      }));
      setSelectedRoleId(nuevo.id);
    } else if (modalModo === "editar" && rolEditando) {
      setPersonal((prev) => ({
        ...prev,
        roles: prev.roles.map((r) =>
          r.id === rolEditando.id
            ? { ...r, nombre: data.nombre, descripcion: data.descripcion }
            : r,
        ),
      }));
    }
    setModalAbierto(false);
  };

  const manejarEliminar = (id: string) => {
    setPersonal((prev) => {
      const nuevos = prev.roles.filter((r) => r.id !== id);
      const { [id]: _omit, ...rest } = prev.camposPorRol;

      if (selectedRoleId === id) {
        const siguiente = nuevos.find((r) => r.activo) ?? nuevos[0] ?? undefined;
        setSelectedRoleId(siguiente?.id);
        setCampoSeleccionadoId(undefined);
      }

      return {
        ...prev,
        roles: nuevos,
        camposPorRol: rest,
      };
    });
    setModalAbierto(false);
  };

  const abrirCrearCampo = () => {
    let idRol = selectedRoleId;
    if (!idRol) {
      const primeroActivo = roles.find((r) => r.activo)?.id ?? roles[0]?.id;
      if (primeroActivo) {
        setSelectedRoleId(primeroActivo);
        idRol = primeroActivo;
      }
    }
    if (!idRol) return;

    setModalCampoModo("crear");
    setCampoEditando(undefined);
    setModalCampoAbierto(true);
  };

  const abrirEditarCampo = (campo: CampoEvento) => {
    if (campo.immutable) return;
    setModalCampoModo("editar");
    setCampoEditando(campo);
    setModalCampoAbierto(true);
  };

  const cerrarModalCampo = () => {
    setModalCampoAbierto(false);
  };

  const manejarGuardarCampo = (data: CampoEvento) => {
    if (!selectedRoleId) return;
    setPersonal((prev) => {
      const lista = prev.camposPorRol[selectedRoleId] ?? [];
      if (modalCampoModo === "crear") {
        const nuevo: CampoEvento = {
          id: generarCampoId(),
          nombre: data.nombre,
          tipo: data.tipo,
        };
        return {
          ...prev,
          camposPorRol: {
            ...prev.camposPorRol,
            [selectedRoleId]: [...lista, nuevo],
          },
        };
      }
      if (modalCampoModo === "editar" && campoEditando) {
        return {
          ...prev,
          camposPorRol: {
            ...prev.camposPorRol,
            [selectedRoleId]: lista.map((c) =>
              c.id === campoEditando.id
                ? { ...c, nombre: data.nombre, tipo: data.tipo }
                : c,
            ),
          },
        };
      }
      return prev;
    });
    setModalCampoAbierto(false);
  };

  const manejarEliminarCampo = (id: string) => {
    if (!selectedRoleId) return;
    setPersonal((prev) => ({
      ...prev,
      camposPorRol: {
        ...prev.camposPorRol,
        [selectedRoleId]: (prev.camposPorRol[selectedRoleId] ?? []).filter(
          (c) => c.id !== id,
        ),
      },
    }));
    setModalCampoAbierto(false);
    setCampoSeleccionadoId(undefined);
  };

  return (
    <section className="flex-1 h-full min-h-0 flex flex-col">
      <div className="px-10 pt-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Personal
        </h1>
        <button
          type="button"
          onClick={abrirCrear}
          className="rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white text-sm font-semibold px-4 py-2 shadow-md"
        >
          Añadir personal
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-10 pb-6">
        {/* Selección de roles */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Selección
          </p>
          <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">
              Haz clic sobre un rol para seleccionarlo (solo uno a la
              vez). El seleccionado se resalta en lila. Usa el
              interruptor para activar/inactivar ese rol. Doble clic
              sobre la tarjeta abre el modal para editar el rol.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0DDFB] bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((rol) => {
                const activo = !!rol.activo;
                const seleccionado = selectedRoleId === rol.id;
                return (
                  <div
                    key={rol.id}
                    onClick={() => seleccionarRol(rol.id)}
                    onDoubleClick={() => abrirEditar(rol)}
                    className={`rounded-2xl border px-4 py-3 cursor-pointer ${
                      seleccionado
                        ? "bg-[#EFF0FF] border-[#C9C5FF]"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          activo ? "text-[#5B4AE5]" : "text-slate-700"
                        }`}
                      >
                        {rol.nombre}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRol(rol.id);
                        }}
                        className={`h-5 w-10 rounded-full transition ${
                          activo ? "bg-[#5B4AE5]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`block h-5 w-5 bg-white rounded-full shadow transform transition ${
                            activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {rol.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Campos necesarios del rol seleccionado */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">
              Campos necesarios
            </p>
            <button
              type="button"
              onClick={abrirCrearCampo}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-[#5B4AE5] to-[#7B5CFF] text-white shadow-md flex items-center justify-center"
            >
              +
            </button>
          </div>

          <div className="mb-3 rounded-xl bg-[#F7F7FF] border border-[#E0DDFB] px-4 py-3">
            <p className="text-[11px] text-slate-600">
              Primero selecciona un rol. Los campos predefinidos
              (Nombre, Apellido paterno, Apellido materno, Correo)
              aparecen en gris y no se pueden editar ni eliminar. Haz
              clic en un campo editable para seleccionarlo (resaltado
              lila). Doble clic abre el modal de edición. Usa “+” para
              agregar un nuevo campo al rol. Para eliminar un campo
              editable, ábrelo en modo edición y pulsa el ícono de
              basura.
            </p>
          </div>

          {selectedRoleId ? (
            <div className="flex flex-wrap gap-3">
              {(camposPorRol[selectedRoleId] ?? []).map((campo) => {
                const seleccionado = campoSeleccionadoId === campo.id;
                const noEditable = !!campo.immutable;

                const baseClase =
                  "inline-flex items-center rounded-full px-4 py-2 text-sm border transition";
                const claseEstado = noEditable
                  ? "bg-slate-200 text-slate-600 border-slate-300"
                  : seleccionado
                  ? "bg-[#EFF0FF] text-[#5B4AE5] border-[#C9C5FF]"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-[#EFF0FF] hover:text-[#5B4AE5] hover:border-[#C9C5FF]";

                return (
                  <button
                    key={campo.id}
                    type="button"
                    onClick={() => setCampoSeleccionadoId(campo.id)}
                    onDoubleClick={() => abrirEditarCampo(campo)}
                    className={`${baseClase} ${claseEstado}`}
                  >
                    {campo.nombre}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Selecciona un rol para configurar sus campos.
            </p>
          )}
        </div>
      </div>

      <FooterAdminEventos
        onBack={() => {
          setSlideDir("prev");
          navigate("../informacion");
        }}
        onNext={() => {
          setSlideDir("next");
          navigate("../integrantes");
        }}
        step={{ current: 2, total: 5 }}
      />

      <ModalRolPersonal
        key={`${modalModo}-${rolEditando?.id ?? "nuevo"}`}
        abierto={modalAbierto}
        modo={modalModo}
        rol={rolEditando}
        onGuardar={manejarGuardar}
        onEliminar={manejarEliminar}
        onCerrar={cerrarModal}
      />

      <ModalCampoEvento
        key={`${modalCampoModo}-${campoEditando?.id ?? "nuevo"}`}
        abierto={modalCampoAbierto}
        modo={modalCampoModo}
        campo={campoEditando}
        onGuardar={manejarGuardarCampo}
        onEliminar={manejarEliminarCampo}
        onCerrar={cerrarModalCampo}
      />
    </section>
  );
};

export default SeccionPersonal;

import { useState, useMemo } from 'react'
import {
  ChevronDown, ChevronUp, BookOpen, Rocket, Building2, Home,
  Users, FileText, DollarSign, Hammer, LayoutDashboard,
  TrendingUp, Shield, HelpCircle, Briefcase, BarChart3, UserCog
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import RoleBadge from '@/components/common/RoleBadge'
import { useAuth } from '@/context/AuthContext'

// roles: undefined = visible para todos los roles. Si se define, debe reflejar
// exactamente los mismos roles que dan acceso al módulo real (ver Sidebar y App/index.jsx),
// para que esta guía nunca ofrezca ayuda de algo que el usuario no puede abrir.
const helpSections = [
  {
    id: 'primeros-pasos',
    title: 'Primeros pasos',
    icon: Rocket,
    color: '#2563EB',
    content: (
      <>
        <h4>Bienvenido a Elipse</h4>
        <p>Elipse es el sistema de gestión de preventas inmobiliarias que centraliza proyectos, unidades, compradores, contratos, cobranza y comisiones de vendedores en una sola plataforma.</p>

        <h4>Inicio de sesión</h4>
        <p>Ingresa con el correo y contraseña que te proporcionó el administrador. Si olvidaste tu contraseña, contacta al administrador del sistema para restablecerla.</p>

        <h4>Navegación</h4>
        <p>El menú lateral izquierdo te da acceso a los módulos principales. La sección que estás viendo siempre queda resaltada. Los módulos visibles dependen del rol asignado a tu cuenta — el acceso al botón <strong>Ayuda</strong>, siempre visible al final del menú, no cambia.</p>

        <h4>Roles del sistema</h4>
        <ul>
          <li><strong>Administrador:</strong> acceso total a todos los módulos, usuarios y configuraciones.</li>
          <li><strong>Gerente:</strong> gestión de proyectos, contratos, cobranza, vendedores y reportes. Puede editar contratos.</li>
          <li><strong>Vendedor:</strong> gestión de compradores, creación y consulta de sus propios contratos, y consulta de su perfil de comisiones ("Mi Perfil").</li>
          <li><strong>Cobranza:</strong> consulta de proyectos y contratos, registro y seguimiento de pagos.</li>
        </ul>
        <p>Esta guía se ajusta automáticamente: solo muestra las secciones de los módulos a los que tu rol tiene acceso.</p>
      </>
    )
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: '#2563EB',
    roles: ['admin', 'gerente', 'cobranza'],
    content: (
      <>
        <h4>Vista general</h4>
        <p>El dashboard es la pantalla principal del sistema. Muestra el pulso de tu operación de cobranza en tiempo real. No está disponible para el rol Vendedor, cuya pantalla de inicio es el módulo de Contratos.</p>

        <h4>Cards de alertas</h4>
        <p>Indicadores principales:</p>
        <ul>
          <li><strong>Pagos vencidos:</strong> pagos cuya fecha de vencimiento ya pasó.</li>
          <li><strong>Vencen este mes:</strong> próximos cobros del mes en curso.</li>
          <li><strong>Próximos 30 días:</strong> pagos por cobrar en los próximos 30 días.</li>
          <li><strong>Listos para confirmar:</strong> hitos pagados que falta marcar como completados.</li>
        </ul>

        <h4>Cobranza por periodo</h4>
        <p>Sección que muestra el total cobrado en un periodo configurable: hoy, esta semana, este mes, este año o un rango personalizado. Incluye total USD, equivalente MXN, número de movimientos y TC promedio del periodo. El periodo se calcula con la <strong>fecha del tipo de cambio</strong> de cada pago (la fecha real del cobro), no con la fecha en que se capturó en el sistema.</p>

        <h4>Semáforo de hitos de obra</h4>
        <p>Muestra el estado global de los hitos pendientes en toda la operación: cuántos están en rojo, amarillo y verde. Si hay hitos vencidos, lista los principales para acción inmediata.</p>

        <h4>Listas de pagos por vencer y vencidos</h4>
        <p>En la parte inferior del dashboard, dos listas accionables con los próximos pagos por cobrar y los vencidos. Click en cualquier item para ir al pago correspondiente.</p>
      </>
    )
  },
  {
    id: 'usuarios',
    title: 'Usuarios',
    icon: UserCog,
    color: '#4F46E5',
    roles: ['admin'],
    content: (
      <>
        <h4>Acceso al módulo</h4>
        <p>El módulo de Usuarios es exclusivo para el rol <strong>Administrador</strong>. Desde aquí se crean y administran todas las cuentas del sistema.</p>

        <h4>Crear un usuario</h4>
        <p>Click en <strong>"Nuevo usuario"</strong>. Captura nombre, correo, contraseña y asigna uno de los cuatro roles: Administrador, Gerente de ventas, Vendedor o Cobranza.</p>

        <h4>Activar / desactivar usuarios</h4>
        <p>Un usuario marcado como <strong>Inactivo</strong> no puede iniciar sesión, pero conserva su historial (contratos, comisiones, pagos registrados). Úsalo para dar de baja a alguien sin perder trazabilidad, en lugar de eliminarlo.</p>

        <h4>Editar y eliminar</h4>
        <p>Puedes actualizar nombre, correo y rol de un usuario en cualquier momento. Eliminar una cuenta es una acción definitiva; si el usuario tiene historial asociado (por ejemplo contratos como vendedor), es preferible desactivarla.</p>

        <h4>Filtros</h4>
        <p>La lista se puede filtrar por rol y por estatus (activos / inactivos), y buscar por nombre o correo.</p>
      </>
    )
  },
  {
    id: 'proyectos',
    title: 'Proyectos',
    icon: Building2,
    color: '#7C3AED',
    content: (
      <>
        <h4>Crear un proyecto</h4>
        <p>Click en <strong>"Nuevo proyecto"</strong> desde el módulo de Proyectos. Captura nombre, ubicación, descripción y estatus del desarrollo. Crear, editar y eliminar proyectos está reservado a Administrador y Gerente; el resto de los roles puede consultarlos.</p>

        <h4>Estados del proyecto</h4>
        <ul>
          <li><strong>En desarrollo:</strong> proyecto activo en construcción o planeación.</li>
          <li><strong>Activo:</strong> proyecto en venta.</li>
          <li><strong>Pausado:</strong> proyecto temporalmente detenido.</li>
          <li><strong>Cerrado:</strong> proyecto finalizado, ya no admite nuevas ventas.</li>
        </ul>

        <h4>Gestión de unidades</h4>
        <p>Cada proyecto contiene unidades individuales (departamentos, casas, lotes, etc.). Desde el detalle del proyecto puedes agregar, editar y monitorear el estatus de cada unidad.</p>

        <h4>Cambio de estatus automático</h4>
        <p>Cuando se firma un contrato sobre una unidad, su estatus cambia automáticamente: <em>disponible → apartada → en escrituración → vendida → entregada</em>.</p>
      </>
    )
  },
  {
    id: 'unidades',
    title: 'Unidades',
    icon: Home,
    color: '#059669',
    content: (
      <>
        <h4>Capturar una unidad</h4>
        <p>Desde el detalle de un proyecto, click en <strong>"Agregar unidad"</strong>. Captura el identificador único de la unidad (ej: A-101, Lote 12), tipo, ubicación dentro del desarrollo y precio de lista en USD.</p>

        <h4>Superficies</h4>
        <p>Captura dos áreas independientes:</p>
        <ul>
          <li><strong>Superficie techada:</strong> área construida cubierta (m²).</li>
          <li><strong>Superficie abierta:</strong> patios, jardines, terrazas (m²).</li>
        </ul>

        <h4>Bodega</h4>
        <p>Si la unidad incluye bodega, activa el toggle y captura número de bodega y sus dimensiones en m².</p>

        <h4>Precios</h4>
        <p>Los precios se capturan siempre en <strong>USD</strong>. El sistema convertirá automáticamente a MXN al generar contratos usando el tipo de cambio que captures en cada contrato.</p>
      </>
    )
  },
  {
    id: 'compradores',
    title: 'Compradores',
    icon: Users,
    color: '#D97706',
    content: (
      <>
        <h4>Registrar un comprador</h4>
        <p>Captura los datos del cliente potencial: nombre completo, RFC, teléfono, correo y dirección. Estos datos se reutilizan al crear contratos.</p>

        <h4>Comprador como persona física o moral</h4>
        <p>Indica si el comprador es persona física o moral. Para personas morales captura también razón social y representante legal.</p>

        <h4>Comprador desde el contrato</h4>
        <p>Si al crear un contrato necesitas registrar un comprador nuevo, puedes hacerlo sin salir del formulario usando el botón <strong>"Nuevo comprador"</strong> dentro del modal.</p>

        <h4>Edición de compradores</h4>
        <p>Los datos del comprador se pueden actualizar en cualquier momento. Estos cambios se reflejan en todos sus contratos asociados.</p>
      </>
    )
  },
  {
    id: 'contratos',
    title: 'Contratos',
    icon: FileText,
    color: '#1B3A5C',
    content: (
      <>
        <h4>Crear un contrato</h4>
        <p>Desde el módulo de Contratos, click en <strong>"Nuevo contrato"</strong>. Selecciona el proyecto, unidad disponible y comprador. Si el comprador no existe, puedes crearlo desde el mismo modal. Administrador, Gerente y Vendedor pueden crear contratos.</p>

        <h4>Vendedor asignado</h4>
        <p>Todo contrato queda asociado a un vendedor. Un usuario con rol <strong>Vendedor</strong> solo puede ver y gestionar los contratos donde él es el vendedor asignado; Administrador, Gerente y Cobranza ven todos los contratos.</p>

        <h4>Modalidades de seguimiento</h4>
        <p>Cada contrato debe definir cómo se hará el seguimiento de pagos:</p>
        <ul>
          <li><strong>Por mensualidades:</strong> enganche + N mensualidades fijas. Ideal para esquemas de crédito directo.</li>
          <li><strong>Por avance de obra:</strong> pagos atados a hitos de construcción (cimentación, estructura, acabados, etc.). Ideal para preventas en obra en construcción.</li>
        </ul>

        <h4>Tipo de cambio</h4>
        <p>Cada contrato captura un tipo de cambio MXN/USD y su fecha. Este TC se usa como referencia inicial; al registrar cada pago se captura un TC actualizado del día.</p>

        <h4>Documentación adjunta</h4>
        <p>Al crear o editar un contrato puedes adjuntar archivos en la sección <strong>"Documentación"</strong>: escrituras, identificaciones, comprobantes, planos, etc. Se aceptan PDF, imágenes, Word y Excel hasta 20MB por archivo.</p>

        <h4>Estados del contrato</h4>
        <ul>
          <li><strong>Promesa:</strong> contrato firmado en etapa inicial.</li>
          <li><strong>Definitivo:</strong> contrato formalizado.</li>
          <li><strong>Escriturado:</strong> escritura pública firmada.</li>
          <li><strong>Entregado:</strong> unidad entregada al comprador.</li>
          <li><strong>Cancelado:</strong> contrato dado de baja.</li>
        </ul>

        <h4>Calendario automático</h4>
        <p>Al crear un contrato el calendario de pagos se genera <strong>automáticamente</strong>. No necesitas un paso extra.</p>

        <h4>Editar un contrato</h4>
        <p>Solo Administrador y Gerente pueden editar. Abre el detalle del contrato y click en <strong>"Editar"</strong> arriba a la derecha. Algunos campos como proyecto, unidad y comprador no se pueden modificar después de creado el contrato.</p>

        <h4>Regeneración del calendario</h4>
        <p>Si cambias campos críticos (montos, modalidad, hitos, fechas clave), el sistema regenera el calendario automáticamente al guardar. <strong>Los pagos ya cobrados se preservan;</strong> solo se eliminan los pagos pendientes para crear el nuevo calendario.</p>
      </>
    )
  },
  {
    id: 'pagos-cobranza',
    title: 'Pagos y cobranza',
    icon: DollarSign,
    color: '#059669',
    content: (
      <>
        <h4>Acceso al módulo</h4>
        <p>El módulo de Pagos requiere que selecciones un <strong>proyecto</strong> para mostrar sus contratos abiertos (con saldo pendiente). Un Vendedor solo verá, en modo consulta, los pagos de sus propios contratos: puede revisar el estado de cuenta pero no registrar cobros. Administrador, Gerente y Cobranza pueden registrar pagos.</p>

        <h4>Visualización por contrato</h4>
        <p>Cada contrato aparece como una card colapsable que muestra: comprador, unidad, saldo total, progreso de cobranza y pagos vencidos. Click en la card para expandir y ver todos los pagos individuales.</p>

        <h4>Registrar un pago</h4>
        <ol>
          <li>Click en <strong>"Registrar"</strong> en el pago correspondiente.</li>
          <li>Captura el tipo de cambio del día (se sugiere el último usado).</li>
          <li>Captura el monto en USD. El sistema mostrará el equivalente MXN en vivo.</li>
          <li>Selecciona método de pago, captura referencia y notas si aplica.</li>
          <li>Adjunta comprobantes (transferencia, depósito, recibo).</li>
          <li>Guarda. El pago queda registrado con su TC histórico y con la fecha de cobro que capturaste — esa fecha, no la de captura en el sistema, es la que usan los reportes y el dashboard.</li>
        </ol>

        <h4>Pagos parciales</h4>
        <p>Puedes registrar pagos parciales en cualquier momento. El sistema lleva el control del saldo pendiente y de los movimientos acumulados de cada pago.</p>

        <h4>Alertas y vencimientos</h4>
        <p>En el dashboard verás las alertas activas: pagos vencidos, vencen este mes, próximos 30 días. Cada alerta es accionable: click para ir directo al pago correspondiente.</p>

        <h4>Comprobantes</h4>
        <p>Los comprobantes (PDF o imagen) se adjuntan a cada movimiento y quedan disponibles para consulta histórica.</p>
      </>
    )
  },
  {
    id: 'hitos-obra',
    title: 'Hitos de obra (Avance de obra)',
    icon: Hammer,
    color: '#C8A45A',
    content: (
      <>
        <h4>Cuándo usar esta modalidad</h4>
        <p>Selecciona <strong>"Por avance de obra"</strong> en contratos cuando el cobro está atado a etapas de construcción y no a calendarios mensuales fijos.</p>

        <h4>Captura de hitos</h4>
        <p>Al crear el contrato, define cada hito con tres datos:</p>
        <ul>
          <li><strong>Nombre:</strong> descripción del hito (ej: "Cimentación", "Estructura 50%", "Acabados").</li>
          <li><strong>Monto en USD:</strong> cantidad a cobrar al completar el hito.</li>
          <li><strong>Fecha compromiso de entrega:</strong> fecha en que el desarrollador se compromete a entregar el hito.</li>
        </ul>
        <p>La suma de enganche + todos los hitos debe coincidir con el precio de venta. El sistema te avisará si no cuadra.</p>

        <h4>Flujo de cobro de hitos</h4>
        <ol>
          <li><strong>Registrar el pago:</strong> el hito puede cobrarse en cualquier momento, total o parcialmente, sin necesidad de marcarlo como completado primero.</li>
          <li><strong>Marcar como completado:</strong> una vez que hay al menos un pago, el hito puede marcarse como completado. Se captura una fecha compromiso (editable después).</li>
          <li><strong>Revertir:</strong> Administrador y Gerente pueden revertir un hito completado a pendiente sin perder los pagos registrados.</li>
        </ol>

        <h4>Semáforo de hitos</h4>
        <p>Cada hito pendiente muestra un semáforo basado en su fecha compromiso:</p>
        <ul>
          <li><strong>🟢 Verde — A tiempo:</strong> más de 15 días para el vencimiento.</li>
          <li><strong>🟡 Amarillo — Por vencer:</strong> 15 días o menos.</li>
          <li><strong>🔴 Rojo — Vencido:</strong> la fecha compromiso ya pasó.</li>
          <li><strong>🟣 Entregado:</strong> hito ya marcado como completado.</li>
        </ul>

        <h4>Línea de tiempo visual</h4>
        <p>En el detalle de cada contrato por avance de obra encontrarás una línea de tiempo vertical con todos los hitos, su estado actual, fecha compromiso y monto.</p>
      </>
    )
  },
  {
    id: 'vendedores',
    title: 'Vendedores y comisiones',
    icon: Briefcase,
    color: '#DB2777',
    roles: ['admin', 'gerente', 'vendedor'],
    content: (
      <>
        <h4>Acceso al módulo</h4>
        <p>Administrador y Gerente ven el listado completo de vendedores con su desempeño y estado de cuenta de comisiones. Un usuario con rol <strong>Vendedor</strong> no ve el listado, pero accede a su propio perfil desde <strong>"Mi Perfil"</strong> al fondo del menú. El rol Cobranza no tiene acceso a este módulo.</p>

        <h4>Perfil de un vendedor</h4>
        <p>Muestra sus contratos activos y, por cada uno, la comisión asociada: porcentaje asignado, monto total de comisión, monto pagado y saldo pendiente.</p>

        <h4>Asignar el porcentaje de comisión</h4>
        <p>Solo <strong>Administrador</strong> puede asignar o cambiar el porcentaje de comisión de un contrato (desde el detalle del contrato). El porcentaje se calcula sobre el <strong>precio de venta total</strong> del contrato, no sobre lo efectivamente cobrado al comprador.</p>

        <h4>Bloqueo del porcentaje</h4>
        <p>El porcentaje puede reasignarse cualquier número de veces mientras el contrato esté en estatus <em>promesa</em>, <em>definitivo</em> o <em>escriturado</em>. Se bloquea automáticamente al llegar a <em>entregado</em> o <em>cancelado</em>.</p>

        <h4>Registrar un pago de comisión</h4>
        <p>Administrador y Gerente pueden registrar abonos de comisión al vendedor desde el perfil del vendedor o el detalle del contrato. Esto no depende del estatus del contrato: puede pagarse comisión aunque la asignación del porcentaje ya esté bloqueada.</p>

        <h4>Historial</h4>
        <p>Cada cambio de porcentaje y cada pago de comisión queda registrado con fecha, monto y quién lo capturó, disponible para consulta en todo momento.</p>
      </>
    )
  },
  {
    id: 'reportes',
    title: 'Reportes',
    icon: BarChart3,
    color: '#0891B2',
    roles: ['admin', 'gerente'],
    content: (
      <>
        <h4>Acceso al módulo</h4>
        <p>Reportes está disponible solo para Administrador y Gerente.</p>

        <h4>Vendido vs. cobrado</h4>
        <p>Gráfica combinada (barras + línea) que compara el monto vendido contra el monto efectivamente cobrado, con presets de periodo (este año, este mes o un rango personalizado) y agrupación por mes, semana o día.</p>

        <h4>Adeudos a vendedores</h4>
        <p>Lista el saldo pendiente de comisión por pagar a cada vendedor, calculado a partir de la información del módulo de Vendedores.</p>

        <h4>Ranking de vendedores</h4>
        <p>Compara a los vendedores por monto total vendido o por número de contratos, según el criterio que selecciones.</p>

        <h4>Próximamente</h4>
        <p>La pestaña "Próximamente" muestra un adelanto de funciones planeadas (proyección de cobranza, embudo del pipeline, cartera vencida por antigüedad, comparativo interanual, exportar/compartir reportes, resumen semanal automático). Aún no están disponibles.</p>

        <h4>Sobre las fechas</h4>
        <p>Todo lo que involucra pagos en estos reportes se agrupa por la <strong>fecha del tipo de cambio</strong> capturada en cada pago (la fecha real del cobro), no por la fecha en que el pago se registró en el sistema. Un pago capturado hoy pero con fecha de cobro de hace dos semanas aparecerá en el periodo de hace dos semanas.</p>
      </>
    )
  },
  {
    id: 'doble-moneda',
    title: 'Doble moneda (USD / MXN)',
    icon: TrendingUp,
    color: '#0EA5E9',
    content: (
      <>
        <h4>Filosofía del sistema</h4>
        <p>Todos los montos se almacenan en <strong>USD</strong> como moneda fuente. El equivalente MXN se calcula sobre la marcha usando un tipo de cambio que se captura en momentos clave.</p>

        <h4>Dos niveles de tipo de cambio</h4>
        <ul>
          <li><strong>TC del contrato:</strong> se captura una sola vez al firmar el contrato. Sirve de referencia inicial y para mostrar el precio de venta original en MXN.</li>
          <li><strong>TC del movimiento:</strong> se captura cada vez que se registra un pago. Refleja el TC del día en que efectivamente se cobró, lo cual es fundamental para reportes financieros precisos.</li>
        </ul>

        <h4>Histórico de TC</h4>
        <p>Cada movimiento queda con su TC y la fecha en que se aplicó. Esto permite reconstruir el equivalente MXN exacto de cualquier cobro, incluso meses después.</p>

        <h4>Visualización</h4>
        <p>En toda la interfaz verás el monto USD como dato principal y el equivalente MXN debajo en gris (≈ $X MXN). Las cantidades grandes (sumas, totales) usan el TC más reciente o el promedio ponderado del periodo según el contexto.</p>

        <h4>Conversiones automáticas</h4>
        <p>No tienes que hacer cálculos manuales: el sistema convierte en tiempo real mientras capturas montos y muestra el resultado debajo del campo de entrada.</p>
      </>
    )
  },
  {
    id: 'roles-permisos',
    title: 'Roles y permisos',
    icon: Shield,
    color: '#DC2626',
    content: (
      <>
        <h4>Niveles de acceso</h4>
        <p>El sistema maneja cuatro roles con permisos diferenciados:</p>

        <h4>Administrador</h4>
        <ul>
          <li>Acceso total a todos los módulos, incluyendo Usuarios y Reportes.</li>
          <li>Gestión de usuarios: crear, editar rol, activar/desactivar y eliminar.</li>
          <li>Crear, editar y eliminar contratos, proyectos y unidades.</li>
          <li>Único rol que puede asignar o cambiar el porcentaje de comisión de un contrato.</li>
          <li>Eliminar pagos y revertir hitos.</li>
        </ul>

        <h4>Gerente</h4>
        <ul>
          <li>Gestión completa de proyectos, unidades, contratos y compradores.</li>
          <li>Editar contratos (incluyendo regeneración de calendario).</li>
          <li>Registro y consulta de pagos, y registro de pagos de comisión a vendedores.</li>
          <li>Acceso al listado completo de Vendedores y al módulo de Reportes.</li>
          <li>Revertir hitos completados.</li>
          <li>No gestiona usuarios ni asigna porcentajes de comisión.</li>
        </ul>

        <h4>Vendedor</h4>
        <ul>
          <li>Consulta de proyectos y unidades.</li>
          <li>Gestión de compradores.</li>
          <li>Creación y consulta de sus propios contratos (sin edición y sin ver contratos de otros vendedores).</li>
          <li>Consulta de los pagos de sus propios contratos, sin poder registrarlos.</li>
          <li>Consulta de su propio perfil de comisiones ("Mi Perfil").</li>
          <li>Sin acceso a Dashboard, Usuarios, Reportes ni al listado general de Vendedores.</li>
        </ul>

        <h4>Cobranza</h4>
        <ul>
          <li>Consulta de Dashboard, proyectos y contratos (todos, sin restricción de dueño).</li>
          <li>Registro de pagos y movimientos.</li>
          <li>Carga de comprobantes.</li>
          <li>Marcar hitos como completados.</li>
          <li>Sin acceso a gestión de proyectos, unidades, Vendedores, Reportes ni Usuarios.</li>
        </ul>
      </>
    )
  },
  {
    id: 'faq',
    title: 'Preguntas frecuentes',
    icon: HelpCircle,
    color: '#6B7280',
    content: (
      <>
        <h4>¿Por qué no veo todas las secciones de esta guía?</h4>
        <p>El contenido de este Centro de Ayuda se ajusta a tu rol: solo se muestran las secciones de los módulos a los que tu cuenta tiene acceso. Si necesitas acceso a un módulo adicional, contacta al administrador del sistema.</p>

        <h4>¿Por qué no puedo cambiar el proyecto/unidad/comprador de un contrato existente?</h4>
        <p>Estos campos están bloqueados al editar porque modificarlos rompería la integridad referencial del sistema (los pagos ya registrados quedarían huérfanos, las unidades quedarían con estatus incorrecto). Si necesitas cambiar alguno de estos, cancela el contrato existente y crea uno nuevo.</p>

        <h4>¿Qué pasa si edito el monto de un contrato que ya tiene pagos cobrados?</h4>
        <p>El sistema detecta que se trata de un cambio crítico y muestra una advertencia. Al confirmar, regenera el calendario de pagos pero <strong>conserva los pagos ya cobrados</strong> como histórico. Los pagos pendientes se eliminan y se crean nuevos según los nuevos montos.</p>

        <h4>¿Por qué no puedo registrar pago de un hito si dice "Bloqueado"?</h4>
        <p>En el flujo actualizado de hitos, los pagos se registran libremente — ya no se requiere marcar el hito como completado antes. Si ves "Bloqueado", probablemente sea un pago de mensualidad de un contrato cancelado. Verifica el estado del contrato.</p>

        <h4>¿Cómo sé qué tipo de cambio usar al registrar un pago?</h4>
        <p>El sistema sugiere automáticamente el último TC usado en el contrato o el TC inicial del contrato. Si tienes el TC oficial del día (DOF, Banxico, banco) cápturalo manualmente. Lo importante es que el TC refleje la fecha real del cobro, ya que esa es la fecha que usan el dashboard y los reportes.</p>

        <h4>¿Puedo eliminar un pago ya registrado?</h4>
        <p>Solo los administradores pueden eliminar pagos. Esta operación es definitiva, así que en su lugar se recomienda registrar un movimiento de ajuste con nota explicativa.</p>

        <h4>¿Cómo cancelo un contrato?</h4>
        <p>Edita el contrato y cambia su estatus a "Cancelado". La unidad volverá automáticamente a estado "Disponible" y quedará lista para asignarse a otro comprador. Los pagos previos quedan en el histórico.</p>

        <h4>¿Los archivos adjuntos tienen límite de tamaño?</h4>
        <p>Sí. Cada archivo individual puede pesar hasta <strong>20 MB</strong>. Los formatos permitidos son: PDF, imágenes (JPG, PNG, WEBP), Word (.doc, .docx) y Excel (.xls, .xlsx).</p>

        <h4>¿Cómo funciona el semáforo de hitos?</h4>
        <p>El semáforo se calcula con base en la fecha compromiso de entrega vs la fecha actual. Verde: más de 15 días. Amarillo: 15 días o menos. Rojo: la fecha compromiso ya pasó. Una vez que el hito se marca como completado, deja de mostrar semáforo y aparece como "Entregado".</p>

        <h4>¿Quién puede asignar o cambiar el porcentaje de comisión de un vendedor?</h4>
        <p>Solo el rol Administrador. Gerente puede registrar los pagos de esa comisión una vez asignada, pero no puede cambiar el porcentaje.</p>

        <h4>¿Quién puede ver los comprobantes de pago?</h4>
        <p>Cualquier usuario con acceso al módulo de pagos puede consultarlos. Para eliminarlos se requiere rol admin o gerente.</p>

        <h4>¿Cómo reporto un problema o sugerencia?</h4>
        <p>Contacta al administrador del sistema o al equipo de soporte técnico del proveedor.</p>
      </>
    )
  }
]

const HelpSection = ({ section, isOpen, onToggle }) => {
  const Icon = section.icon

  return (
    <div className="rounded-xl border bg-white overflow-hidden transition-all" style={{ borderColor: 'var(--color-border-light)', boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[var(--color-surface)] transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}1A` }}>
          <Icon size={18} style={{ color: section.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{section.title}</h3>
        </div>
        <div className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t help-content" style={{ borderColor: 'var(--color-border-light)' }}>
          {section.content}
        </div>
      )}
    </div>
  )
}

const Help = () => {
  const [openSections, setOpenSections] = useState({})
  const { user } = useAuth()

  const visibleSections = useMemo(
    () => helpSections.filter(section => !section.roles || section.roles.includes(user?.role)),
    [user?.role]
  )

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Centro de Ayuda"
        subtitle="Guía completa de uso de la plataforma Elipse"
      />

      {/* Intro */}
      <div className="rounded-xl border bg-white p-5 mb-5 flex items-start gap-3" style={{ borderColor: 'var(--color-border-light)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-muted)' }}>
          <BookOpen size={18} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>¿Cómo usar esta guía?</p>
            {user?.role && <RoleBadge role={user.role} size="xs" />}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Selecciona cualquier sección para ver instrucciones detalladas. Cada bloque puede expandirse y colapsarse de forma independiente. Las secciones que ves están filtradas según tu rol, para mostrarte solo lo relevante a los módulos a los que tienes acceso. Si tienes dudas que no se respondan aquí, contacta a tu administrador del sistema.
          </p>
        </div>
      </div>

      {/* Acordeón de secciones */}
      <div className="space-y-2.5">
        {visibleSections.map(section => (
          <HelpSection
            key={section.id}
            section={section}
            isOpen={!!openSections[section.id]}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 mb-4">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          ¿Necesitas más ayuda? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  )
}

export default Help

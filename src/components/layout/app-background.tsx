/**
 * Fondo global: negro profundo con haces de luz plateados/azulados
 * que entran en diagonal desde la esquina superior izquierda.
 */
export function AppBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_40%,#0b0f17_0%,#05070b_60%,#020305_100%)]" />

      {/* Haces de luz: más tenues en mobile, donde la card ocupa casi todo el ancho */}
      <div className="absolute inset-0 opacity-55 sm:opacity-100">
        {/* Haz principal: plateado brillante */}
        <div
          className="absolute -left-[30%] top-[0%] h-[34vh] w-[110vw] -rotate-[28deg] rounded-full mix-blend-screen blur-[70px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(230,232,245,0.95) 0%, rgba(170,175,200,0.6) 30%, rgba(90,100,130,0.25) 55%, transparent 80%)",
          }}
        />
        {/* Haz secundario: lavanda */}
        <div
          className="absolute -left-[35%] top-[24%] h-[22vh] w-[100vw] -rotate-[30deg] rounded-full opacity-80 mix-blend-screen blur-[60px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(200,198,225,0.85) 0%, rgba(130,130,165,0.45) 35%, transparent 75%)",
          }}
        />
        {/* Haz inferior: azul pizarra */}
        <div
          className="absolute -left-[40%] top-[46%] h-[32vh] w-[95vw] -rotate-[32deg] rounded-full opacity-80 mix-blend-screen blur-[90px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(80,110,165,0.9) 0%, rgba(50,70,110,0.5) 40%, transparent 80%)",
          }}
        />
        {/* Brillo fino sobre el haz principal */}
        <div
          className="absolute -left-[20%] top-[14%] h-[4vh] w-[80vw] -rotate-[28deg] rounded-full opacity-70 mix-blend-screen blur-[18px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(210,215,235,0.35) 45%, transparent 85%)",
        }}
      />
      </div>

      {/* Viñeta: oscurece derecha y abajo para dar foco a la card */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_0%_25%,transparent_0%,transparent_50%,rgba(2,3,5,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent" />
    </div>
  );
}

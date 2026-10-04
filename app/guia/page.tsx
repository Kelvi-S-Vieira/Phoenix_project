import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";

// Generic reference content — "Hábitos, testosterona e manutenção" — ported
// from the prototype (projeto_fenix_app_final.html, <section id="page-
// habitos">, lines 4660-4795). Per the product decision recorded at the top
// of MIGRATION_PLAN.md ("Guia: build a generic version only — none of the
// owner's personal clinical data"), every section below has been rewritten
// to strip the prototype's first/second-person references to one specific
// person's exam results, target weight, and in-progress protocol — e.g. the
// prototype's disclaimer named a specific testosterone value (~250 ng/dL at
// 113.5kg) and a specific re-test target weight (95-97kg); section 02's
// "doctor-flag" said "isso é exatamente o que já está em andamento no seu
// caso"; section 07 said "você já tem isso definido: repetir [exam list]
// quando atingir 95-97 kg". None of that survives here — the substance of
// each section (what it's about, the real health information) is kept, but
// generalized into reference content that doesn't claim the reader already
// has a specific plan, number or diagnosis. Pure static content, same
// pattern as every other purely-informational page in this codebase — no DB
// table needed.
export default async function GuiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/complete-profile");
  if (profile.role === "personal") redirect("/personal");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const unit = await getServerWeightUnit();

  return (
    <div className="app-shell">
      <Sidebar
        variant="aluno"
        accountName={`${profile.name ?? "Aluno"} · Aluno`}
        currentWeight={profile.current_weight}
        targetWeight={profile.target_weight}
        sections={ALUNO_SIDEBAR_SECTIONS}
        unit={unit}
      />
      <main className="main-content">
        <div className="fx-app">
          <div className="top">
            <div className="eyebrow">Projeto Fênix · Guia</div>
            <h1>Hábitos, testosterona e manutenção</h1>
            <div className="sub">
              Referência sobre o que você controla no dia a dia — e o que é conversa de consultório.
            </div>
          </div>

          <div className="sup-disclaimer">
            ⚠️ <b>Isto é conteúdo educativo geral</b>, não diagnóstico nem prescrição. A
            interpretação de exames hormonais, decisões sobre repetir exames, suplementação com
            efeito hormonal ou qualquer ajuste em medicação devem sempre passar pelo seu médico.
            Aqui organizamos os hábitos que a ciência associa a testosterona e saúde metabólica em
            geral, para você aplicar no dia a dia.
          </div>

          <div className="card">
            <div className="guia-toc">
              <a href="#sono">Sono</a>
              <a href="#composicao">Composição corporal</a>
              <a href="#treino">Treino de força</a>
              <a href="#estresse">Estresse e cortisol</a>
              <a href="#nutrientes">Gorduras e micronutrientes</a>
              <a href="#alcool">Álcool e cafeína</a>
              <a href="#exames">Quando reavaliar com exames</a>
              <a href="#manutencao">Manutenção pós-emagrecimento</a>
              <a href="#tirzepatida">Parar tratamentos com efeito hormonal</a>
            </div>
          </div>

          <div className="card" id="sono">
            <h2><span className="guia-num">01</span> Sono</h2>
            <p>
              É provavelmente a variável com maior peso entre as que você controla diretamente. A
              maior parte da liberação de testosterona acontece durante o sono, especialmente nos
              ciclos mais profundos.
            </p>
            <ul>
              <li>
                <b>Duração:</b> a literatura converge em 7–9h por noite para a maioria dos adultos;
                abaixo de 5–6h de forma repetida está associado a queda mensurável de testosterona
                em poucos dias.
              </li>
              <li>
                <b>Consistência:</b> dormir e acordar em horários parecidos todo dia (incluindo fim
                de semana) importa tanto quanto a duração total.
              </li>
              <li>
                <b>Sinais de alerta:</b> ronco alto, pausas respiratórias observadas por outra
                pessoa, sonolência diurna forte — vale investigar apneia do sono com um médico, que
                também impacta hormônios.
              </li>
            </ul>
          </div>

          <div className="card" id="composicao">
            <h2><span className="guia-num">02</span> Composição corporal</h2>
            <p>
              Gordura corporal em excesso — principalmente visceral (abdominal) — converte
              testosterona em estrogênio via uma enzima chamada aromatase, e está associada a SHBG
              alterada. Isso é parte do motivo pelo qual perder peso, por si só, tende a melhorar os
              níveis hormonais em quem tem excesso de peso.
            </p>
          </div>

          <div className="card" id="treino">
            <h2><span className="guia-num">03</span> Treino de força</h2>
            <p>
              Treino de resistência com cargas altas tem o efeito agudo mais consistente sobre
              testosterona entre os tipos de exercício. Exercícios multiarticulares com grandes
              grupos musculares (agachamento, leg press, supino) tendem a ter resposta maior que
              isolados.
            </p>
            <p>
              Overtraining crônico (volume/frequência muito acima da recuperação disponível) tem o
              efeito oposto — aumenta cortisol e pode reduzir testosterona. Isso reforça a lógica de
              &quot;menos séries, mais qualidade&quot; quando o objetivo é sustentar hormônios em
              equilíbrio.
            </p>
          </div>

          <div className="card" id="estresse">
            <h2><span className="guia-num">04</span> Estresse e cortisol</h2>
            <p>
              Cortisol cronicamente elevado (estresse mal gerenciado, sono ruim, déficit calórico
              muito agressivo por longos períodos) tende a suprimir o eixo hormonal reprodutivo. Não
              precisa eliminar estresse — precisa de janelas de recuperação.
            </p>
            <ul>
              <li>
                Déficit calórico muito agressivo por semanas seguidas é um estressor metabólico —
                mais um motivo para preferir um ritmo moderado de perda de peso em vez de acelerar
                cortando calorias demais.
              </li>
              <li>
                Práticas simples com evidência: exposição à luz solar pela manhã, pausas reais fora
                da tela, atividade física recreativa sem pressão de performance.
              </li>
            </ul>
          </div>

          <div className="card" id="nutrientes">
            <h2><span className="guia-num">05</span> Gorduras e micronutrientes</h2>
            <p>
              Colesterol é o precursor bioquímico da testosterona — dietas extremamente pobres em
              gordura por longos períodos podem prejudicar a produção hormonal. Alguns
              micronutrientes têm papel bem documentado quando há deficiência:
            </p>
            <div className="guia-grid2">
              <div className="guia-mini-card">
                <div className="title">Vitamina D</div>
                <p>
                  Deficiência é comum e está associada a testosterona mais baixa. Corrigir a
                  deficiência (quando ela existe, confirmada por exame) tende a ajudar; suplementar
                  sem deficiência real não mostra o mesmo benefício.
                </p>
              </div>
              <div className="guia-mini-card">
                <div className="title">Zinco e magnésio</div>
                <p>
                  Cofatores importantes na síntese hormonal. Deficiência (comum em dietas muito
                  restritivas) prejudica; excesso não traz ganho adicional.
                </p>
              </div>
              <div className="guia-mini-card">
                <div className="title">Creatina</div>
                <p>
                  Não eleva testosterona diretamente, mas é um dos suplementos com mais evidência
                  para desempenho e retenção de massa magra em treino de força — 3–5g/dia é a dose
                  mais estudada.
                </p>
              </div>
              <div className="guia-mini-card">
                <div className="title">Gordura na dieta</div>
                <p>
                  Manter uma proporção razoável de gorduras (não precisa ser dieta &quot;low
                  fat&quot;) ajuda a sustentar a produção hormonal durante o déficit calórico.
                </p>
              </div>
            </div>
            <div className="sup-disclaimer" style={{ marginTop: 14, marginBottom: 0 }}>
              ⚕️ <b>Dose e necessidade real de suplementação</b> (inclusive se vale a pena
              suplementar vitamina D/zinco/magnésio) é conversa para fazer com seu médico à luz dos
              seus próprios exames — carência real muda a decisão, e excesso de alguns desses
              nutrientes também tem risco.
            </div>
          </div>

          <div className="card" id="alcool">
            <h2><span className="guia-num">06</span> Álcool e cafeína</h2>
            <ul>
              <li>
                <b>Álcool:</b> consumo regular e em quantidade relevante está associado a queda de
                testosterona e piora de qualidade de sono. Uso ocasional e moderado tem impacto bem
                menor.
              </li>
              <li>
                <b>Cafeína:</b> em doses moderadas não parece prejudicar; o problema costuma ser
                indireto — cafeína tarde do dia atrapalhando o sono, que aí sim impacta o hormônio.
              </li>
            </ul>
          </div>

          <div className="card" id="exames">
            <h2><span className="guia-num">07</span> Quando reavaliar com exames</h2>
            <p>
              Quando uma mudança de composição corporal relevante (emagrecimento significativo) é
              concluída, costuma fazer sentido conversar com seu médico sobre repetir exames
              hormonais básicos — tipicamente <b>testosterona total, testosterona livre, SHBG, LH,
              FSH e estradiol</b> — comparando com uma medição anterior, se houver uma.
            </p>
            <ul>
              <li>
                Isso ajuda a separar &quot;queda de testosterona por excesso de peso&quot; (que
                tende a melhorar sozinha ao emagrecer) de uma causa que precise de investigação
                clínica à parte.
              </li>
              <li>
                A interpretação dos números (o que é baixo para a idade da pessoa, se LH/FSH indicam
                causa primária ou secundária, necessidade ou não de reposição) é decisão médica —
                não existe &quot;número mágico&quot; que se aplique igual para todo mundo.
              </li>
            </ul>
          </div>

          <div className="card" id="manutencao">
            <h2><span className="guia-num">08</span> Manutenção pós-emagrecimento</h2>
            <p>A parte que mais gente erra não é perder peso — é não recuperar depois. Alguns pontos estruturais:</p>
            <ul>
              <li>
                Passar por uma fase de transição de calorias (de déficit para manutenção) gradual,
                não de uma vez — evita o efeito sanfona.
              </li>
              <li>
                Continuar pesando e registrando pelo menos algumas semanas por mês depois de bater a
                meta, para pegar reganho cedo.
              </li>
              <li>
                Manter o treino de força como prioridade — é o que sustenta a massa magra e o
                metabolismo depois da fase de perda de peso.
              </li>
              <li>
                Ter uma &quot;faixa de manutenção&quot; (ex: um intervalo de 3–4 kg), não um número
                fixo — flutuação de 1–2 kg é normal e não é motivo de alarme.
              </li>
              <li>
                Reavaliar hábitos que sustentaram a perda (proteína alta, cardio regular) como parte
                da rotina permanente, não só &quot;enquanto durar a dieta&quot;.
              </li>
            </ul>
          </div>

          <div className="card" id="tirzepatida">
            <h2><span className="guia-num">09</span> Sobre parar tratamentos com efeito hormonal</h2>
            <p>
              Isso é sempre uma decisão médica, não algo para planejar por conta própria — mas há
              pontos gerais que costumam entrar nessa conversa, seja para quem usa medicação para
              perda de peso, anabolizantes, ou está em reposição hormonal (TRH):
            </p>
            <ul>
              <li>
                Reganho de peso ou perda de massa magra após interromper esse tipo de tratamento é
                um padrão bem documentado quando os hábitos não estão sólidos — por isso construir
                uma rotina consistente (treino, proteína, cardio) é o que sustenta o resultado no
                longo prazo, não a substância em si.
              </li>
              <li>
                No caso de anabolizantes, a interrupção costuma vir acompanhada de uma queda
                temporária na produção natural de testosterona, já que o eixo hormonal fica
                suprimido durante o uso — período em que sono, treino e composição corporal pesam
                ainda mais para minimizar os efeitos.
              </li>
              <li>
                Em reposição hormonal, suspender de forma abrupta tende a trazer sintomas (fadiga,
                queda de libido, mudanças de humor) até o corpo reencontrar um novo equilíbrio — por
                isso costuma ser conduzida em etapas, com acompanhamento.
              </li>
              <li>
                De forma geral, a transição é discutida em etapas (redução gradual de dose, período
                de observação) em vez de suspensão abrupta — mas o formato exato é sempre definido
                com quem acompanha o caso de perto.
              </li>
              <li>
                Vale levar essa pergunta ao médico com antecedência, não só quando a meta for batida
                — dá tempo de planejar a estratégia com calma, junto com ele.
              </li>
            </ul>
            <div className="sup-disclaimer" style={{ marginTop: 14, marginBottom: 0 }}>
              ⚕️ Este guia não substitui essa conversa — é só o pano de fundo para você chegar nela
              com mais contexto.
            </div>
          </div>

          <div className="footer-note">
            PROJETO FÊNIX — hábito é o que você controla; exame é o que seu médico interpreta.
          </div>
        </div>
      </main>
    </div>
  );
}

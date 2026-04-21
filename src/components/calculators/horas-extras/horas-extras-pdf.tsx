"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { HorasExtrasFormValues } from "@/modules/calculators/horas-extras/schema";
import { HorasExtrasOutput } from "@/modules/calculators/horas-extras/types";
import { SindicatoData } from "@/modules/sindicatos/types";
import { formatCurrency } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#333" },
  header: { borderBottom: "1px solid #ccc", paddingBottom: 15, marginBottom: 20, flexDirection: "row", alignItems: "center" },
  logoContainer: { width: 60, height: 60, marginRight: 15, borderRadius: 30, overflow: 'hidden', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '100%', height: '100%', objectFit: 'contain' },
  logoFallbackText: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", color: "#1e3a8a", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", backgroundColor: "#f3f4f6", padding: 6, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#555" },
  value: { fontWeight: "bold" },
  highlightRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #ccc", fontWeight: "bold" },
  totalBox: { backgroundColor: "#eff6ff", padding: 15, borderRadius: 5, marginTop: 10, border: "1px solid #bfdbfe" },
  totalLabel: { fontSize: 12, color: "#1e3a8a" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a", textAlign: "right" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#9ca3af", borderTop: "1px solid #eee", paddingTop: 10 },
  cctInfo: { fontSize: 9, color: "#4b5563", marginTop: 5, fontStyle: "italic" }
});

interface HorasExtrasPDFProps {
  input: HorasExtrasFormValues;
  result: HorasExtrasOutput;
  sindicato: SindicatoData | { nomeFantasia: string; cnpj: string; logoUrl?: string | null };
}

export const HorasExtrasPDF = ({ input, result, sindicato }: HorasExtrasPDFProps) => {
  const dataExtenso = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {sindicato.logoUrl ? (
              <Image src={sindicato.logoUrl} style={styles.logoImage} />
            ) : (
              <Text style={styles.logoFallbackText}>{sindicato.nomeFantasia.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{sindicato.nomeFantasia}</Text>
            <Text style={styles.subtitle}>CNPJ: {sindicato.cnpj}</Text>
            <Text style={styles.subtitle}>Laudo Oficial - Calculadora de Horas Extras</Text>
            <Text style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>Trabalhador(a): {input.nomeAssociado} | CPF: {input.cpfAssociado}</Text>
          </View>
        </View>

        {/* PARÂMETROS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Parâmetros do Cálculo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Salário Base:</Text>
            <Text style={styles.value}>{formatCurrency(input.salarioBase)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Divisor de Horas:</Text>
            <Text style={styles.value}>{input.divisorHoras}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dias Úteis no Mês:</Text>
            <Text style={styles.value}>{input.diasUteisMes}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Domingos/Feriados no Mês:</Text>
            <Text style={styles.value}>{input.domingosFeriadosMes}</Text>
          </View>
          <Text style={styles.cctInfo}>* Parâmetros balizados pela CCT da Entidade: Adicional Normal ({result.percentualNormalUtilizado}%) e Adicional Domingo/Feriado ({result.percentualDomingoUtilizado}%).</Text>
        </View>

        {/* CÁLCULO DAS HORAS EXTRAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Memória de Cálculo - Horas Extras</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Valor da Hora Normal (Base):</Text>
            <Text style={styles.value}>{formatCurrency(result.valorHoraNormal)}</Text>
          </View>
          
          <View style={{ marginTop: 10 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Hora Extra Normal ({input.qtdHorasNormais} hrs x {formatCurrency(result.valorHoraExtraNormal)}):</Text>
              <Text style={styles.value}>{formatCurrency(result.totalFinanceiroNormal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Hora Extra Dom/Fer ({input.qtdHorasDomingo} hrs x {formatCurrency(result.valorHoraExtraDomingo)}):</Text>
              <Text style={styles.value}>{formatCurrency(result.totalFinanceiroDomingo)}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Text>Total de Horas Extras:</Text>
              <Text>{formatCurrency(result.totalFinanceiroHorasExtras)}</Text>
            </View>
          </View>
        </View>

        {/* CÁLCULO DO DSR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Reflexo no Descanso Semanal Remunerado (DSR)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fórmula Aplicada:</Text>
            <Text style={styles.value}>(Total H.E / Dias Úteis) x Domingos/Feriados</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cálculo:</Text>
            <Text style={styles.value}>({formatCurrency(result.totalFinanceiroHorasExtras)} / {input.diasUteisMes}) x {input.domingosFeriadosMes}</Text>
          </View>
          <View style={styles.highlightRow}>
            <Text>Valor do Reflexo (DSR):</Text>
            <Text>{formatCurrency(result.dsrHorasExtras)}</Text>
          </View>
        </View>

        {/* TOTAL GERAL */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total a Receber (Horas Extras + DSR)</Text>
          <Text style={styles.totalValue}>{formatCurrency(result.totalGeral)}</Text>
        </View>

        {/* RODAPÉ */}
        <Text style={styles.footer}>
          Documento gerado eletronicamente pelo sistema SindiCalculo em {dataExtenso}.
          {'\n'}Os valores são calculados com base na Convenção Coletiva de Trabalho da categoria.
        </Text>

      </Page>
    </Document>
  );
};

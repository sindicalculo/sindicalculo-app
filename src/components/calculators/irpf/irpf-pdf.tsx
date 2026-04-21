import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { IRPFFormValues } from '@/modules/calculators/irpf/schema';
import { IRPFOutput } from '@/modules/calculators/irpf/types';
import { SindicatoData } from '@/modules/sindicatos/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, borderBottom: '2 solid #1e3a8a', paddingBottom: 10 },
  logo: { width: 60, height: 60, marginRight: 15, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: 5, color: '#0f172a', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, borderBottom: '1 solid #f1f5f9', paddingBottom: 3 },
  label: { fontSize: 10, color: '#475569' },
  value: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },
  cardResult: { backgroundColor: '#eff6ff', padding: 15, borderRadius: 5, marginTop: 10, border: '1 solid #bfdbfe' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10, textAlign: 'center' },
  highlightRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  highlightLabel: { fontSize: 12, color: '#1e3a8a', fontWeight: 'bold' },
  highlightValue: { fontSize: 14, color: '#1e3a8a', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTop: '1 solid #e2e8f0', paddingTop: 10 },
  alertBox: { backgroundColor: '#dcfce7', padding: 10, borderRadius: 5, marginTop: 10, border: '1 solid #86efac' },
  alertText: { fontSize: 10, color: '#166534', textAlign: 'center', fontWeight: 'bold' }
});

interface IRPFPDFProps {
  input: IRPFFormValues;
  result: IRPFOutput;
  sindicato: SindicatoData;
}

export function IRPFPDF({ input, result, sindicato }: IRPFPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {sindicato.logoUrl ? (
            <Image src={sindicato.logoUrl} style={styles.logo} />
          ) : (
            <View style={[styles.logo, { backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 10, color: '#94a3b8' }}>SEM LOGO</Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{sindicato.nomeFantasia}</Text>
            <Text style={styles.subtitle}>CNPJ: {sindicato.cnpj}</Text>
            <Text style={styles.subtitle}>Demonstrativo de Imposto de Renda Retido na Fonte (IRRF 2026)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação do Trabalhador</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome Completo:</Text>
            <Text style={styles.value}>{input.nomeAssociado || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.value}>{input.cpfAssociado || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dependentes para IRPF:</Text>
            <Text style={styles.value}>{input.dependentes}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rendimentos e Deduções</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Salário Bruto (Base INSS):</Text>
            <Text style={styles.value}>{formatCurrency(result.salarioBruto)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>(-) Desconto INSS Retido:</Text>
            <Text style={styles.value}>{formatCurrency(result.inssRetido)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>(-) Dedução por Dependentes:</Text>
            <Text style={styles.value}>{formatCurrency(result.deducaoDependentes)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>(-) Pensão Alimentícia:</Text>
            <Text style={styles.value}>{formatCurrency(result.pensaoAlimenticia)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>(-) Outras Deduções:</Text>
            <Text style={styles.value}>{formatCurrency(result.outrasDeducoes)}</Text>
          </View>
        </View>

        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            ✓ O sistema elegeu automaticamente o modelo {result.melhorCenario === 'SIMPLIFICADO' ? 'DESCONTO SIMPLIFICADO' : 'DEDUÇÕES LEGAIS'} por ser mais vantajoso ao trabalhador.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cenário Vencedor: {result.melhorCenario === 'SIMPLIFICADO' ? 'Desconto Simplificado' : 'Deduções Legais'}</Text>
          
          {result.melhorCenario === 'SIMPLIFICADO' && (
            <View style={styles.row}>
              <Text style={styles.label}>(-) Abatimento Simplificado:</Text>
              <Text style={styles.value}>{formatCurrency(result.valorDescontoSimplificado)}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Base de Cálculo do IRPF:</Text>
            <Text style={styles.value}>{formatCurrency(result.baseCalculoFinal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Alíquota Efetiva:</Text>
            <Text style={styles.value}>{result.aliquotaEfetivaFinal.toFixed(2)}%</Text>
          </View>
        </View>

        <View style={styles.cardResult}>
          <Text style={styles.cardTitle}>Resultado da Apuração Mensal</Text>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightLabel}>Imposto de Renda Retido:</Text>
            <Text style={[styles.highlightValue, { color: '#ef4444' }]}>- {formatCurrency(result.impostoDevidoFinal)}</Text>
          </View>
          <View style={[styles.highlightRow, { marginTop: 10, borderTop: '1 solid #bfdbfe', paddingTop: 10 }]}>
            <Text style={styles.highlightLabel}>Salário Líquido (após INSS e IRPF):</Text>
            <Text style={[styles.highlightValue, { color: '#16a34a' }]}>{formatCurrency(result.salarioLiquido)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Gerado pelo Sistema SindiCalculo em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
          Este documento é um simulador informativo baseado nas regras da Receita Federal do Brasil vigentes, não substituindo o holerite oficial da empresa.
        </Text>
      </Page>
    </Document>
  );
}

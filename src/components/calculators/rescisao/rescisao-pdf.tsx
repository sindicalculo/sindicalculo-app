/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { TerminationResult } from '@/modules/calculators/rescisao/types';
import { RescisaoFormValues } from '@/modules/calculators/rescisao/schema';

// Estilos
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937' },
  header: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 15, marginBottom: 20, alignItems: 'center' },
  logoFallback: { width: 50, height: 50, backgroundColor: '#1e3a8a', justifyContent: 'center', alignItems: 'center', borderRadius: 4, marginRight: 15 },
  logoImage: { width: 50, height: 50, marginRight: 15, objectFit: 'contain' },
  logoText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerText: { flex: 1, justifyContent: 'center' },
  sindicatoName: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
  sindicatoCnpj: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  
  docTitle: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6', padding: 8, textTransform: 'uppercase', color: '#374151' },
  
  section: { marginTop: 15 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4, marginBottom: 8, color: '#1e3a8a' },
  
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '40%', fontWeight: 'bold', color: '#4b5563' },
  value: { width: '60%', color: '#111827' },
  
  columnsWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  column: { width: '48%' },
  
  colTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center', padding: 5 },
  proventosTitle: { backgroundColor: '#dcfce7', color: '#166534' }, 
  descontosTitle: { backgroundColor: '#fee2e2', color: '#991b1b' }, 
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4 },
  itemText: { color: '#374151' },
  itemTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#d1d5db', fontWeight: 'bold' },
  
  footer: { marginTop: 30, borderTopWidth: 2, borderTopColor: '#1e3a8a', paddingTop: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  
  watermark: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#9ca3af' }
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

const reasonMap: Record<string, string> = {
  DISPENSA_SJC: "Dispensa Sem Justa Causa",
  DISPENSA_JC: "Dispensa Com Justa Causa",
  PEDIDO_DEMISSAO: "Pedido de Demissão",
  COMUM_ACORDO: "Acordo (Reforma Trabalhista)",
  EXP_NO_PRAZO: "Término de Contrato"
};

interface RescisaoPdfProps {
  input: RescisaoFormValues;
  result: TerminationResult;
  sindicato: {
    nomeFantasia: string;
    cnpj: string;
    logoUrl?: string;
  };
}

export const RescisaoPDF = ({ input, result, sindicato }: RescisaoPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        {sindicato.logoUrl ? (
          <Image src={sindicato.logoUrl} style={styles.logoImage} />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoText}>{sindicato.nomeFantasia.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.sindicatoName}>{sindicato.nomeFantasia}</Text>
          <Text style={styles.sindicatoCnpj}>CNPJ: {sindicato.cnpj}</Text>
          <Text style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>Trabalhador(a): {input.nomeAssociado} | CPF: {input.cpfAssociado}</Text>
        </View>
      </View>

      <Text style={styles.docTitle}>Demonstrativo de Cálculo Rescisório</Text>

      {/* IDENTIFICAÇÃO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Vínculo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Data de Admissão:</Text>
          <Text style={styles.value}>{formatDate(input.dataAdmissao)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data de Demissão:</Text>
          <Text style={styles.value}>{formatDate(input.dataDemissao)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Salário Base:</Text>
          <Text style={styles.value}>{formatCurrency(input.salarioBase)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Médias / Variáveis:</Text>
          <Text style={styles.value}>{formatCurrency(input.mediasAdicionais || 0)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Motivo do Desligamento:</Text>
          <Text style={styles.value}>{reasonMap[input.reason] || input.reason}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Aviso Prévio:</Text>
          <Text style={styles.value}>{input.noticeStatus}</Text>
        </View>
      </View>

      {/* DEMONSTRATIVO FINANCEIRO */}
      <View style={styles.columnsWrapper}>
        {/* PROVENTOS */}
        <View style={styles.column}>
          <Text style={[styles.colTitle, styles.proventosTitle]}>Proventos (Entradas)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Saldo de Salário</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.saldoSalario)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Aviso Prévio</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.avisoPrevio)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>13º Salário</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.decimoTerceiro)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Férias Proporcionais</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.feriasProporcionais)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Férias Vencidas</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.feriasVencidas)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>1/3 sobre Férias</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.tercoFerias)}</Text>
          </View>
          
          <View style={styles.itemTotal}>
            <Text>Total de Proventos</Text>
            <Text>{formatCurrency(result.proventos.totalProventos)}</Text>
          </View>
        </View>

        {/* DESCONTOS */}
        <View style={styles.column}>
          <Text style={[styles.colTitle, styles.descontosTitle]}>Descontos (Saídas)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>INSS Salário</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.inssSalario)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>INSS 13º</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.inss13)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>IRRF Salário</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.irrfSalario)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>IRRF 13º</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.irrf13)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Outros Descontos</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.outrosDescontos)}</Text>
          </View>

          <View style={styles.itemTotal}>
            <Text>Total de Descontos</Text>
            <Text>{formatCurrency(result.descontos.totalDescontos)}</Text>
          </View>
        </View>
      </View>

      {/* FOOTER / TOTAIS */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Líquido a Receber (Pago pela Empresa):</Text>
          <Text style={styles.totalValue}>{formatCurrency(result.resumo.pagoPelaEmpresa)}</Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 6 }]}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4b5563' }}>Saque FGTS (Depósitos + Multa):</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4b5563' }}>{formatCurrency(result.resumo.pagoPelaCaixa)}</Text>
        </View>
      </View>

      <Text style={styles.watermark}>Gerado via SindiCalculo - Plataforma de Cálculos Trabalhistas</Text>
    </Page>
  </Document>
);

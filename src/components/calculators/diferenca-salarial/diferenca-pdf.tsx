/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { DiferencaSalarialOutput } from '@/modules/calculators/diferenca-salarial/types';
import { DiferencaSalarialFormValues } from '@/modules/calculators/diferenca-salarial/schema';

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
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4 },
  itemText: { color: '#374151' },
  
  footer: { marginTop: 30, borderTopWidth: 2, borderTopColor: '#1e3a8a', paddingTop: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  
  watermark: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#9ca3af' }
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface DiferencaPdfProps {
  input: DiferencaSalarialFormValues;
  result: DiferencaSalarialOutput;
  sindicato: {
    nomeFantasia: string;
    cnpj: string;
    logoUrl?: string;
  };
}

export const DiferencaPDF = ({ input, result, sindicato }: DiferencaPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
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
          <Text style={styles.docTitle}>Laudo de Passivo - Diferença Salarial CCT</Text>
          <Text style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>Trabalhador(a): {input.nomeAssociado || 'Não Informado'} | CPF: {input.cpfAssociado || 'Não Informado'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Memória de Cálculo (Base)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Salário Anterior:</Text>
          <Text style={styles.value}>{formatCurrency(input.salarioAntigo)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Percentual da CCT:</Text>
          <Text style={styles.value}>{input.percentualReajuste}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Novo Salário Devido:</Text>
          <Text style={styles.value}>{formatCurrency(result.salarioNovoCalculado)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diferença Mensal Devida:</Text>
          <Text style={styles.value}>{formatCurrency(result.diferencaMensalCalculada)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Meses em Atraso:</Text>
          <Text style={styles.value}>{input.mesesAtraso} meses</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apuração do Passivo</Text>
        
        <View style={styles.itemRow}>
          <Text style={styles.itemText}>Diferença Salarial Acumulada ({input.mesesAtraso} meses)</Text>
          <Text style={styles.itemText}>{formatCurrency(result.resultados.diferencaTotalMeses)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText}>Reflexo em 13º Salário</Text>
          <Text style={styles.itemText}>{formatCurrency(result.resultados.reflexoDecimoTerceiro)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText}>Reflexo em Férias + 1/3</Text>
          <Text style={styles.itemText}>{formatCurrency(result.resultados.reflexoFerias)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Passivo Devido Estimado:</Text>
          <Text style={styles.totalValue}>{formatCurrency(result.resultados.totalGeralDevido)}</Text>
        </View>
      </View>

      <Text style={styles.watermark}>Gerado via SindiCalculo - Plataforma de Cálculos Trabalhistas</Text>
    </Page>
  </Document>
);

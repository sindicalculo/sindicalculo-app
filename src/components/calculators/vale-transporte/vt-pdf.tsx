/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ValeTransporteOutput } from '@/modules/calculators/vale-transporte/types';
import { ValeTransporteFormValues } from '@/modules/calculators/vale-transporte/schema';

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
  
  alertBox: { marginTop: 15, padding: 10, borderWidth: 1, borderRadius: 4 },
  alertLegal: { backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534' },
  alertIlegal: { backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' },
  alertText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  
  watermark: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#9ca3af' }
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface VtPdfProps {
  input: ValeTransporteFormValues;
  result: ValeTransporteOutput;
  sindicato: {
    nomeFantasia: string;
    cnpj: string;
    logoUrl?: string;
  };
}

export const VtPDF = ({ input, result, sindicato }: VtPdfProps) => (
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
          <Text style={styles.docTitle}>Laudo de Auditoria - Vale Transporte</Text>
          <Text style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>Trabalhador(a): {input.nomeAssociado || 'Não Informado'} | CPF: {input.cpfAssociado || 'Não Informado'}</Text>
        </View>
      </View>

      <Text style={{ marginBottom: 15, fontSize: 11 }}>
        Base Legal: Art. 4º da Lei 7.418/1985 c/c Art. 9º do Decreto 95.247/1987.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apuração de Custos Mensais</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Salário Base Informado:</Text>
          <Text style={styles.value}>{formatCurrency(input.salarioBase)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dias Úteis no Mês:</Text>
          <Text style={styles.value}>{input.diasUteis} dias</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Custo Diário (Ida + Volta):</Text>
          <Text style={styles.value}>{formatCurrency(input.valorPassagemIda + input.valorPassagemVolta)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Custo Real Total no Mês:</Text>
          <Text style={styles.value}>{formatCurrency(result.custoRealTrajeto)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Teto Legal (6% do Salário Base):</Text>
          <Text style={styles.value}>{formatCurrency(result.tetoLegalDesconto)}</Text>
        </View>
      </View>

      <View style={[styles.alertBox, result.status === 'LEGAL' ? styles.alertLegal : styles.alertIlegal]}>
        {result.status === 'LEGAL' && (
          <Text style={styles.alertText}>SITUAÇÃO REGULAR: A empresa pode descontar até {formatCurrency(result.descontoPermitido)}.</Text>
        )}
        {result.status === 'ISENTO' && (
          <Text style={styles.alertText}>TRABALHADOR NÃO UTILIZA VALE-TRANSPORTE.</Text>
        )}
        {result.status === 'ILEGAL' && (
          <View>
            <Text style={styles.alertText}>SITUAÇÃO IRREGULAR!</Text>
            <Text style={{ textAlign: 'center', marginTop: 4 }}>A empresa está limitada a descontar apenas o custo real ({formatCurrency(result.custoRealTrajeto)}).</Text>
            <Text style={{ textAlign: 'center', marginTop: 4 }}>Descontar os 6% na folha gera um confisco indevido de {formatCurrency(result.diferencaIndevida || 0)}/mês.</Text>
          </View>
        )}
      </View>

      <Text style={styles.watermark}>Gerado via SindiCalculo - Plataforma de Cálculos Trabalhistas</Text>
    </Page>
  </Document>
);

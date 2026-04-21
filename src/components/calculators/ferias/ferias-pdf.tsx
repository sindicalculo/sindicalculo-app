import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { FeriasOutput } from '@/modules/calculators/ferias/types';
import { FeriasFormValues } from '@/modules/calculators/ferias/schema';

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

interface FeriasPdfProps {
  input: FeriasFormValues;
  result: FeriasOutput;
  sindicato: {
    nomeFantasia: string;
    cnpj: string;
    logoUrl?: string;
  };
}

export const FeriasPDF = ({ input, result, sindicato }: FeriasPdfProps) => (
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
          <Text style={styles.docTitle}>Recibo de Férias</Text>
          <Text style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>Trabalhador(a): {input.nomeAssociado || 'Não Informado'} | CPF: {input.cpfAssociado || 'Não Informado'}</Text>
        </View>
      </View>

      <Text style={{ marginBottom: 15, fontSize: 11 }}>
        Período Aquisitivo de Férias Proporcionais: {input.mesesTrabalhados}/12 avos. 
        Dias de Gozo: {result.diasGozoCalculados}. Dias de Abono Pecuniário: {result.diasAbonoCalculados}.
      </Text>

      {/* DEMONSTRATIVO FINANCEIRO */}
      <View style={styles.columnsWrapper}>
        {/* PROVENTOS */}
        <View style={styles.column}>
          <Text style={[styles.colTitle, styles.proventosTitle]}>Proventos (Entradas)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Férias ({result.diasGozoCalculados} dias)</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.valorFeriasGozo)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>1/3 Férias</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.tercoConstitucionalGozo)}</Text>
          </View>
          {input.abonoPecuniario && (
            <>
              <View style={styles.itemRow}>
                <Text style={styles.itemText}>Abono Pecuniário ({result.diasAbonoCalculados} dias)</Text>
                <Text style={styles.itemText}>{formatCurrency(result.proventos.valorAbonoPecuniario)}</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemText}>1/3 Abono</Text>
                <Text style={styles.itemText}>{formatCurrency(result.proventos.tercoConstitucionalAbono)}</Text>
              </View>
            </>
          )}
          
          <View style={styles.itemTotal}>
            <Text>Total Bruto</Text>
            <Text>{formatCurrency(result.proventos.totalProventos)}</Text>
          </View>
        </View>

        {/* DESCONTOS */}
        <View style={styles.column}>
          <Text style={[styles.colTitle, styles.descontosTitle]}>Descontos (Saídas)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>INSS</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.inss)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>IRRF</Text>
            <Text style={styles.itemText}>{formatCurrency(result.descontos.irrf)}</Text>
          </View>

          <View style={styles.itemTotal}>
            <Text>Total Descontos</Text>
            <Text>{formatCurrency(result.descontos.totalDescontos)}</Text>
          </View>
        </View>
      </View>

      {/* FOOTER / TOTAIS */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Líquido a Receber:</Text>
          <Text style={styles.totalValue}>{formatCurrency(result.resumo.totalLiquido)}</Text>
        </View>
      </View>

      <Text style={styles.watermark}>Gerado via SindiCalculo - Plataforma de Cálculos Trabalhistas</Text>
    </Page>
  </Document>
);

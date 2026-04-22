/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { DecimoTerceiroOutput } from '@/modules/calculators/decimo-terceiro/types';
import { DecimoTerceiroFormValues } from '@/modules/calculators/decimo-terceiro/schema';

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

const parcelaLabel = {
  primeira: "1ª Parcela",
  segunda: "2ª Parcela",
  unica: "Parcela Única"
};

interface DecimoPdfProps {
  input: DecimoTerceiroFormValues;
  result: DecimoTerceiroOutput;
  sindicato: {
    nomeFantasia: string;
    cnpj: string;
    logoUrl?: string;
  };
}

export const DecimoPDF = ({ input, result, sindicato }: DecimoPdfProps) => (
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
          <Text style={styles.docTitle}>Recibo de 13º Salário - {parcelaLabel[result.tipoParcela]}</Text>
          <Text style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>Trabalhador(a): {input.nomeAssociado || 'Não Informado'} | CPF: {input.cpfAssociado || 'Não Informado'}</Text>
        </View>
      </View>

      <Text style={{ marginBottom: 15, fontSize: 11 }}>
        Período Aquisitivo Apurado: {result.mesesTrabalhados}/12 avos.
      </Text>

      {/* DEMONSTRATIVO FINANCEIRO */}
      <View style={styles.columnsWrapper}>
        {/* PROVENTOS */}
        <View style={styles.column}>
          <Text style={[styles.colTitle, styles.proventosTitle]}>Proventos (Entradas)</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>13º Salário Bruto</Text>
            <Text style={styles.itemText}>{formatCurrency(result.proventos.valorBruto)}</Text>
          </View>
          
          <View style={styles.itemTotal}>
            <Text>Total Bruto</Text>
            <Text>{formatCurrency(result.proventos.valorBruto)}</Text>
          </View>
        </View>

        {/* DESCONTOS */}
        <View style={styles.column}>
          <Text style={[styles.colTitle, styles.descontosTitle]}>Descontos (Saídas)</Text>
          
          {result.tipoParcela === 'primeira' ? (
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>Sem incidência de impostos</Text>
              <Text style={styles.itemText}>{formatCurrency(0)}</Text>
            </View>
          ) : (
            <>
              {result.descontos.adiantamentoPrimeiraParcela > 0 && (
                <View style={styles.itemRow}>
                  <Text style={styles.itemText}>Adiantamento (1ª Parc)</Text>
                  <Text style={styles.itemText}>{formatCurrency(result.descontos.adiantamentoPrimeiraParcela)}</Text>
                </View>
              )}
              <View style={styles.itemRow}>
                <Text style={styles.itemText}>INSS</Text>
                <Text style={styles.itemText}>{formatCurrency(result.descontos.inss)}</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemText}>IRRF (Tributação Exclusiva)</Text>
                <Text style={styles.itemText}>{formatCurrency(result.descontos.irrf)}</Text>
              </View>
            </>
          )}

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

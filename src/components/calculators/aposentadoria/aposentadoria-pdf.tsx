/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { AposentadoriaFormValues } from '@/modules/calculators/aposentadoria/schema';
import { AposentadoriaOutput } from '@/modules/calculators/aposentadoria/types';
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
  cardResult: { padding: 10, borderRadius: 5, marginBottom: 10, border: '1 solid #e2e8f0' },
  cardTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  cardSubtitle: { fontSize: 9, color: '#64748b' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTop: '1 solid #e2e8f0', paddingTop: 10 },
  elegivelBox: { backgroundColor: '#dcfce7', border: '1 solid #86efac' },
  elegivelText: { color: '#166534' },
  naoElegivelBox: { backgroundColor: '#fff7ed', border: '1 solid #fed7aa' },
  naoElegivelText: { color: '#c2410c' }
});

interface AposentadoriaPDFProps {
  input: AposentadoriaFormValues;
  result: AposentadoriaOutput;
  sindicato: SindicatoData;
}

export function AposentadoriaPDF({ input, result, sindicato }: AposentadoriaPDFProps) {
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
            <Text style={styles.subtitle}>Dossiê Previdenciário - Análise de Regras de Transição (INSS 2026)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação do Segurado</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome Completo:</Text>
            <Text style={styles.value}>{input.nomeAssociado || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.value}>{input.cpfAssociado || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>{format(new Date(input.dataNascimento), 'dd/MM/yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Idade Atual:</Text>
            <Text style={styles.value}>{result.idadeAtualAnos} anos e {result.idadeAtualMeses} meses</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tempo de Contribuição Atual:</Text>
            <Text style={styles.value}>{input.anosContribuicao} anos e {input.mesesContribuicao} meses</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Média Salarial Estimada:</Text>
            <Text style={styles.value}>{formatCurrency(input.mediaSalarial)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico das Regras de Transição (EC 103/2019)</Text>
          
          {result.regras.map((regra, idx) => (
            <View key={idx} style={[styles.cardResult, regra.elegivel ? styles.elegivelBox : styles.naoElegivelBox]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.cardTitle, regra.elegivel ? styles.elegivelText : styles.naoElegivelText]}>
                  {regra.nome}
                </Text>
                <Text style={[styles.cardTitle, regra.elegivel ? styles.elegivelText : styles.naoElegivelText]}>
                  {regra.elegivel ? '✓ APROVADO' : '✕ PENDENTE'}
                </Text>
              </View>
              
              <Text style={styles.cardSubtitle}>
                {regra.elegivel 
                  ? `Data Estimada/Direito Adquirido: ${regra.dataEstimada}` 
                  : `Diagnóstico: ${regra.requisitoFaltante}`
                }
              </Text>
              
              {!regra.elegivel && regra.dataEstimada && regra.dataEstimada !== "-" && (
                <Text style={[styles.cardSubtitle, { marginTop: 4, fontWeight: 'bold' }]}>
                  Previsão de Cumprimento: {regra.dataEstimada}
                </Text>
              )}
              
              {regra.pontosAtuais !== undefined && (
                <Text style={[styles.cardSubtitle, { marginTop: 4 }]}>
                  Pontuação Atual: {regra.pontosAtuais}
                </Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Gerado pelo Sistema SindiCalculo em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
          Este documento é uma estimativa baseada nas informações prestadas e nas regras vigentes em 2026. A concessão oficial depende da análise do INSS.
        </Text>
      </Page>
    </Document>
  );
}

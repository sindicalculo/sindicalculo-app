import { ValeTransporteInput, ValeTransporteOutput } from './types';

export class ValeTransporteCalculator {
  static calculate(input: ValeTransporteInput): ValeTransporteOutput {
    const tetoLegalDesconto = input.salarioBase * 0.06;
    const custoRealTrajeto = (input.valorPassagemIda + input.valorPassagemVolta) * input.diasUteis;
    
    // A lei diz que a empresa pode descontar ATÉ 6%, mas nunca mais que o custo real da passagem.
    const descontoPermitido = Math.min(tetoLegalDesconto, custoRealTrajeto);
    
    let status: 'LEGAL' | 'ILEGAL' | 'ISENTO' = 'LEGAL';
    let diferencaIndevida = 0;

    if (custoRealTrajeto === 0) {
      status = 'ISENTO';
    } else if (tetoLegalDesconto > custoRealTrajeto) {
      // Se o teto é 600, mas o VT custa 200, a empresa só pode descontar 200.
      // Se ela estiver descontando 600 (o teto), é ilegal.
      // A interface vai mostrar pro usuário: "A empresa só pode descontar o Custo Real, não os 6%!"
      status = 'ILEGAL';
      diferencaIndevida = tetoLegalDesconto - custoRealTrajeto;
    }

    return {
      tetoLegalDesconto,
      custoRealTrajeto,
      descontoPermitido,
      status,
      diferencaIndevida
    };
  }
}

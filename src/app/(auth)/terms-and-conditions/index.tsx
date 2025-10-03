import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';

export default function TermsAndConditions() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.mainTitle}>Termos e Condições de Uso</Text>
          <Text style={styles.platformName}>Plataforma Gig</Text>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introdução e Aceitação</Text>
            <Text style={styles.paragraph}>
              Bem-vindo ao Gig! Estes Termos e Condições de Uso ("Termos") 
              estabelecem as regras e diretrizes para o uso da plataforma Gig, 
              um sistema online voltado para a intermediação entre bandas musicais 
              e contratantes, tais como indivíduos, estabelecimentos e organizadores 
              de eventos.
            </Text>
            <Text style={styles.paragraph}>
              Ao criar uma conta, acessar ou utilizar qualquer funcionalidade do Gig, 
              você concorda integralmente com estes Termos. Caso não concorde com 
              qualquer disposição aqui estabelecida, você deve cessar imediatamente 
              o uso da plataforma.
            </Text>
            <Text style={styles.paragraph}>
              O uso continuado da plataforma após qualquer modificação destes Termos 
              constitui sua aceitação das alterações realizadas.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Definições</Text>
            <Text style={styles.paragraph}>
              Para melhor compreensão destes Termos, consideram-se as seguintes definições:
            </Text>
            
            <View style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>Gig ou Plataforma:</Text>
              <Text style={styles.definitionText}>
                Sistema digital móvel e web para intermediação e contratação de 
                bandas e artistas musicais.
              </Text>
            </View>

            <View style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>Usuário:</Text>
              <Text style={styles.definitionText}>
                Qualquer pessoa física ou jurídica que utilize a plataforma, 
                seja como banda ou estabelecimento.
              </Text>
            </View>

            <View style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>Banda:</Text>
              <Text style={styles.definitionText}>
                Grupo musical ou artista individual que oferece seus serviços 
                artísticos por meio da plataforma.
              </Text>
            </View>

            <View style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>Estabelecimento/Contratante:</Text>
              <Text style={styles.definitionText}>
                Pessoa física ou jurídica (bares, casas de show, restaurantes, 
                organizadores de eventos, etc.) que deseja contratar um artista 
                ou banda musical através da plataforma.
              </Text>
            </View>

            <View style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>Evento:</Text>
              <Text style={styles.definitionText}>
                Qualquer apresentação musical, show ou atividade cultural na qual 
                uma banda seja contratada por meio do Gig.
              </Text>
            </View>

            <View style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>Contrato:</Text>
              <Text style={styles.definitionText}>
                Acordo formal estabelecido entre banda e estabelecimento para a 
                realização de um evento, incluindo data, horário, valor e demais 
                condições específicas.
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Cadastro e Elegibilidade</Text>
            
            <Text style={styles.subsectionTitle}>3.1. Requisitos de Cadastro</Text>
            <Text style={styles.paragraph}>
              Para utilizar o Gig, o usuário deve criar uma conta fornecendo 
              informações verdadeiras, precisas, atualizadas e completas. O usuário 
              é responsável por manter a confidencialidade de suas credenciais de 
              acesso.
            </Text>

            <Text style={styles.subsectionTitle}>3.2. Idade Mínima</Text>
            <Text style={styles.paragraph}>
              O usuário deve ter pelo menos 18 (dezoito) anos completos ou estar 
              devidamente autorizado por um responsável legal para utilizar a plataforma.
            </Text>

            <Text style={styles.subsectionTitle}>3.3. Veracidade das Informações</Text>
            <Text style={styles.paragraph}>
              Ao se cadastrar, você declara que todas as informações fornecidas são 
              verdadeiras. O Gig reserva-se o direito de verificar as informações 
              cadastrais a qualquer momento.
            </Text>

            <Text style={styles.subsectionTitle}>3.4. Tipos de Conta</Text>
            <Text style={styles.paragraph}>
              • <Text style={styles.bold}>Conta de Banda:</Text> Destinada a músicos, 
              grupos musicais e artistas que desejam oferecer seus serviços.
            </Text>
            <Text style={styles.paragraph}>
              • <Text style={styles.bold}>Conta de Estabelecimento:</Text> Destinada 
              a locais, empresas e organizadores que desejam contratar apresentações musicais.
            </Text>

            <Text style={styles.subsectionTitle}>3.5. Suspensão e Cancelamento</Text>
            <Text style={styles.paragraph}>
              O Gig pode suspender, cancelar ou restringir contas que:
            </Text>
            <Text style={styles.paragraph}>
              • Forneçam informações falsas, imprecisas ou fraudulentas{'\n'}
              • Violem estes Termos e Condições{'\n'}
              • Pratiquem condutas inadequadas ou ilegais{'\n'}
              • Causem danos à plataforma ou a outros usuários{'\n'}
              • Permaneçam inativas por período prolongado
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Funcionamento da Plataforma</Text>

            <Text style={styles.subsectionTitle}>4.1. Natureza do Serviço</Text>
            <Text style={styles.paragraph}>
              O Gig atua exclusivamente como intermediador entre bandas e 
              contratantes, facilitando a comunicação, negociação e formalização 
              de contratos para apresentações musicais.
            </Text>

            <Text style={styles.subsectionTitle}>4.2. Busca e Descoberta</Text>
            <Text style={styles.paragraph}>
              A plataforma oferece ferramentas de busca e filtros para que 
              estabelecimentos encontrem bandas adequadas às suas necessidades, 
              considerando gênero musical, localização, disponibilidade e faixa 
              de preço.
            </Text>

            <Text style={styles.subsectionTitle}>4.3. Comunicação</Text>
            <Text style={styles.paragraph}>
              O Gig facilita a comunicação inicial entre as partes através de 
              mensagens internas, permitindo discussão de detalhes antes da 
              formalização do contrato.
            </Text>

            <Text style={styles.subsectionTitle}>4.4. Sistema de Contratos</Text>
            <Text style={styles.paragraph}>
              A plataforma disponibiliza um sistema para criação, envio, aceitação 
              e gerenciamento de propostas de contrato, contendo informações essenciais 
              como data, horário, local, duração, valor e condições específicas.
            </Text>

            <Text style={styles.subsectionTitle}>4.5. Avaliações e Reputação</Text>
            <Text style={styles.paragraph}>
              Após a realização de eventos, ambas as partes podem avaliar a experiência, 
              contribuindo para a construção de reputação na plataforma.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Obrigações dos Usuários</Text>

            <Text style={styles.subsectionTitle}>5.1. Obrigações Gerais</Text>
            <Text style={styles.paragraph}>
              Todos os usuários devem:
            </Text>
            <Text style={styles.paragraph}>
              • Fornecer informações verdadeiras e atualizadas{'\n'}
              • Manter a confidencialidade de suas credenciais{'\n'}
              • Comunicar-se de forma respeitosa e profissional{'\n'}
              • Cumprir com os acordos estabelecidos{'\n'}
              • Respeitar direitos autorais e propriedade intelectual{'\n'}
              • Não utilizar a plataforma para fins ilícitos
            </Text>

            <Text style={styles.subsectionTitle}>5.2. Obrigações das Bandas</Text>
            <Text style={styles.paragraph}>
              As bandas cadastradas devem:
            </Text>
            <Text style={styles.paragraph}>
              • Manter perfil atualizado com repertório, fotos e vídeos representativos{'\n'}
              • Informar disponibilidade de agenda com precisão{'\n'}
              • Especificar claramente seus valores e condições{'\n'}
              • Cumprir com horários e compromissos acordados{'\n'}
              • Realizar apresentações com qualidade profissional{'\n'}
              • Informar eventual cancelamento com antecedência razoável{'\n'}
              • Possuir equipamentos adequados ou informar necessidades técnicas
            </Text>

            <Text style={styles.subsectionTitle}>5.3. Obrigações dos Estabelecimentos</Text>
            <Text style={styles.paragraph}>
              Os estabelecimentos devem:
            </Text>
            <Text style={styles.paragraph}>
              • Fornecer informações claras sobre o evento (data, local, tipo, público esperado){'\n'}
              • Especificar infraestrutura disponível (som, iluminação, espaço){'\n'}
              • Honrar valores acordados e realizar pagamentos conforme combinado{'\n'}
              • Fornecer condições adequadas para a apresentação{'\n'}
              • Informar eventual cancelamento com antecedência razoável{'\n'}
              • Cumprir com legislação aplicável (alvarás, direitos autorais, segurança)
            </Text>

            <Text style={styles.subsectionTitle}>5.4. Condutas Proibidas</Text>
            <Text style={styles.paragraph}>
              É expressamente proibido:
            </Text>
            <Text style={styles.paragraph}>
              • Criar perfis falsos ou fraudulentos{'\n'}
              • Intermediar transações fora da plataforma para evasão de taxas{'\n'}
              • Utilizar a plataforma para spam ou publicidade não autorizada{'\n'}
              • Praticar discriminação de qualquer natureza{'\n'}
              • Violar direitos de terceiros{'\n'}
              • Tentar acessar áreas restritas do sistema{'\n'}
              • Realizar engenharia reversa ou copiar a plataforma
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Transações Financeiras</Text>

            <Text style={styles.subsectionTitle}>6.1. Valores e Pagamentos</Text>
            <Text style={styles.paragraph}>
              Os valores das apresentações são livremente negociados entre bandas 
              e estabelecimentos. O Gig não interfere na precificação dos serviços.
            </Text>

            <Text style={styles.subsectionTitle}>6.2. Taxa de Serviço</Text>
            <Text style={styles.paragraph}>
              O Gig pode cobrar uma taxa de serviço sobre transações realizadas 
              através da plataforma. Os valores e condições serão informados de 
              forma transparente antes da confirmação de qualquer contrato.
            </Text>

            <Text style={styles.subsectionTitle}>6.3. Meio de Pagamento</Text>
            <Text style={styles.paragraph}>
              As partes podem escolher o meio de pagamento que melhor atenda suas 
              necessidades, desde que cumprido conforme acordado no contrato.
            </Text>

            <Text style={styles.subsectionTitle}>6.4. Cancelamentos e Reembolsos</Text>
            <Text style={styles.paragraph}>
              Políticas de cancelamento e reembolso devem ser acordadas diretamente 
              entre as partes. O Gig recomenda que essas condições sejam claramente 
              especificadas no contrato.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Limitação de Responsabilidade</Text>

            <Text style={styles.subsectionTitle}>7.1. Papel do Gig</Text>
            <Text style={styles.paragraph}>
              O Gig atua apenas como plataforma de intermediação. Não somos parte 
              dos contratos estabelecidos entre bandas e estabelecimentos, nem 
              assumimos responsabilidade por:
            </Text>
            <Text style={styles.paragraph}>
              • Qualidade das apresentações musicais{'\n'}
              • Cumprimento de acordos entre as partes{'\n'}
              • Condutas de usuários fora da plataforma{'\n'}
              • Danos materiais ou imateriais decorrentes de eventos{'\n'}
              • Questões trabalhistas, previdenciárias ou tributárias{'\n'}
              • Conflitos entre usuários{'\n'}
              • Prejuízos financeiros resultantes de transações
            </Text>

            <Text style={styles.subsectionTitle}>7.2. Disponibilidade do Serviço</Text>
            <Text style={styles.paragraph}>
              Embora nos esforcemos para manter a plataforma sempre disponível, 
              não garantimos funcionamento ininterrupto. O serviço pode ser 
              temporariamente suspenso para manutenção, atualizações ou devido 
              a problemas técnicos.
            </Text>

            <Text style={styles.subsectionTitle}>7.3. Conteúdo de Terceiros</Text>
            <Text style={styles.paragraph}>
              Não nos responsabilizamos por conteúdo publicado por usuários, 
              incluindo textos, fotos, vídeos e áudios. Cada usuário é responsável 
              pelo material que disponibiliza em seu perfil.
            </Text>

            <Text style={styles.subsectionTitle}>7.4. Limitação de Danos</Text>
            <Text style={styles.paragraph}>
              Em nenhuma circunstância o Gig será responsável por danos indiretos, 
              incidentais, especiais, consequenciais ou punitivos, incluindo perda 
              de lucros, dados ou oportunidades de negócio.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Propriedade Intelectual</Text>

            <Text style={styles.subsectionTitle}>8.1. Direitos do Gig</Text>
            <Text style={styles.paragraph}>
              Todos os direitos sobre a plataforma, incluindo design, código, 
              marca, logo e demais elementos, são de propriedade exclusiva do Gig. 
              É proibida a reprodução, distribuição ou uso não autorizado.
            </Text>

            <Text style={styles.subsectionTitle}>8.2. Conteúdo do Usuário</Text>
            <Text style={styles.paragraph}>
              Ao publicar conteúdo na plataforma, você garante possuir todos os 
              direitos necessários e concede ao Gig licença não exclusiva para 
              exibir, reproduzir e distribuir esse conteúdo na plataforma para 
              fins de prestação do serviço.
            </Text>

            <Text style={styles.subsectionTitle}>8.3. Direitos Autorais Musicais</Text>
            <Text style={styles.paragraph}>
              As bandas são responsáveis por quaisquer questões relacionadas a 
              direitos autorais de músicas executadas, incluindo pagamentos ao 
              ECAD ou entidades similares.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Privacidade e Proteção de Dados</Text>

            <Text style={styles.subsectionTitle}>9.1. Política de Privacidade</Text>
            <Text style={styles.paragraph}>
              O tratamento de dados pessoais pelo Gig é regido por nossa Política 
              de Privacidade, disponível separadamente na plataforma, em conformidade 
              com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </Text>

            <Text style={styles.subsectionTitle}>9.2. Coleta de Dados</Text>
            <Text style={styles.paragraph}>
              Coletamos dados necessários para o funcionamento da plataforma, 
              incluindo informações de cadastro, histórico de uso, comunicações 
              e dados de transações.
            </Text>

            <Text style={styles.subsectionTitle}>9.3. Uso de Dados</Text>
            <Text style={styles.paragraph}>
              Os dados coletados são utilizados para: facilitar conexões entre 
              usuários, processar transações, melhorar nossos serviços, comunicações 
              relevantes e cumprimento de obrigações legais.
            </Text>

            <Text style={styles.subsectionTitle}>9.4. Compartilhamento</Text>
            <Text style={styles.paragraph}>
              Não vendemos dados pessoais. Compartilhamentos ocorrem apenas quando 
              necessário para prestação do serviço, com consentimento ou por 
              obrigação legal.
            </Text>

            <Text style={styles.subsectionTitle}>9.5. Direitos dos Titulares</Text>
            <Text style={styles.paragraph}>
              Você tem direito a acessar, corrigir, eliminar, portar seus dados, 
              bem como revogar consentimentos, conforme previsto na LGPD.
            </Text>
          </View>

          {/* Section 10 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Resolução de Conflitos</Text>

            <Text style={styles.subsectionTitle}>10.1. Negociação Direta</Text>
            <Text style={styles.paragraph}>
              Em caso de conflitos entre usuários, encorajamos a resolução amigável 
              através de comunicação direta.
            </Text>

            <Text style={styles.subsectionTitle}>10.2. Mediação</Text>
            <Text style={styles.paragraph}>
              O Gig pode oferecer suporte para mediação de conflitos, porém não 
              atua como árbitro ou juiz das disputas.
            </Text>

            <Text style={styles.subsectionTitle}>10.3. Denúncias</Text>
            <Text style={styles.paragraph}>
              Usuários podem reportar condutas inadequadas através dos canais 
              apropriados na plataforma. Analisaremos cada caso e tomaremos 
              medidas quando necessário.
            </Text>
          </View>

          {/* Section 11 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Modificações dos Termos</Text>

            <Text style={styles.subsectionTitle}>11.1. Direito de Alteração</Text>
            <Text style={styles.paragraph}>
              O Gig reserva-se o direito de modificar estes Termos a qualquer 
              momento, visando melhorar o serviço, adequar-se a mudanças legais 
              ou por outras razões operacionais.
            </Text>

            <Text style={styles.subsectionTitle}>11.2. Notificação</Text>
            <Text style={styles.paragraph}>
              Mudanças significativas serão comunicadas através da plataforma, 
              email ou notificações push. Alterações menores serão refletidas 
              na data de "Última atualização" deste documento.
            </Text>

            <Text style={styles.subsectionTitle}>11.3. Aceitação Continuada</Text>
            <Text style={styles.paragraph}>
              O uso continuado da plataforma após modificações constitui aceitação 
              dos novos termos. Caso não concorde, você deve descontinuar o uso 
              do serviço.
            </Text>
          </View>

          {/* Section 12 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Rescisão</Text>

            <Text style={styles.subsectionTitle}>12.1. Rescisão pelo Usuário</Text>
            <Text style={styles.paragraph}>
              Você pode encerrar sua conta a qualquer momento através das 
              configurações da plataforma ou entrando em contato com nosso suporte.
            </Text>

            <Text style={styles.subsectionTitle}>12.2. Rescisão pelo Gig</Text>
            <Text style={styles.paragraph}>
              Podemos suspender ou encerrar contas que violem estes Termos, 
              pratiquem condutas inadequadas ou por outras razões justificadas, 
              com ou sem aviso prévio.
            </Text>

            <Text style={styles.subsectionTitle}>12.3. Efeitos da Rescisão</Text>
            <Text style={styles.paragraph}>
              Após o encerramento, você perderá acesso à sua conta e aos dados 
              associados. Compromissos já estabelecidos devem ser honrados conforme 
              acordado.
            </Text>
          </View>

          {/* Section 13 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Disposições Gerais</Text>

            <Text style={styles.subsectionTitle}>13.1. Legislação Aplicável</Text>
            <Text style={styles.paragraph}>
              Estes Termos são regidos pelas leis da República Federativa do Brasil.
            </Text>

            <Text style={styles.subsectionTitle}>13.2. Foro</Text>
            <Text style={styles.paragraph}>
              Fica eleito o foro da comarca de Fortaleza, Estado do Ceará, para 
              dirimir quaisquer controvérsias oriundas destes Termos, renunciando 
              as partes a qualquer outro, por mais privilegiado que seja.
            </Text>

            <Text style={styles.subsectionTitle}>13.3. Independência das Cláusulas</Text>
            <Text style={styles.paragraph}>
              Se qualquer disposição destes Termos for considerada inválida ou 
              inexequível, as demais permanecerão em pleno vigor.
            </Text>

            <Text style={styles.subsectionTitle}>13.4. Não Renúncia</Text>
            <Text style={styles.paragraph}>
              A falha do Gig em exigir o cumprimento de qualquer disposição não 
              constitui renúncia ao direito de fazê-lo posteriormente.
            </Text>

            <Text style={styles.subsectionTitle}>13.5. Acordo Integral</Text>
            <Text style={styles.paragraph}>
              Estes Termos, juntamente com a Política de Privacidade, constituem 
              o acordo integral entre você e o Gig.
            </Text>
          </View>

          {/* Section 14 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Contato</Text>
            <Text style={styles.paragraph}>
              Para dúvidas, sugestões ou questões relacionadas a estes Termos, 
              entre em contato através dos seguintes canais:
            </Text>
            <Text style={styles.paragraph}>
              Email: contato@gig.com.br{'\n'}
              Telefone: (85) 3000-0000{'\n'}
              Endereço: Fortaleza, Ceará, Brasil
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao utilizar a plataforma Gig, você reconhece ter lido, compreendido 
              e concordado com estes Termos e Condições de Uso.
            </Text>
          </View>

          {/* Accept Button */}
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => router.back()}
          >
            <Text style={styles.acceptButtonText}>Li e Aceito os Termos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  platformName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lastUpdate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: '600',
  },
  definitionItem: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  definitionTerm: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
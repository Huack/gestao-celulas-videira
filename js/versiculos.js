/**
 * Repositório de versículos do dia.
 * O versículo é selecionado com base na data (dia do ano),
 * garantindo que todos os usuários vejam o mesmo versículo no mesmo dia.
 */
const VERSICULOS = [
  { texto: "Eu sou a videira, vós, as varas; quem está em mim, e eu nele, este dá muito fruto.", ref: "João 15:5" },
  { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", ref: "João 3:16" },
  { texto: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", ref: "Provérbios 3:5" },
  { texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", ref: "Jeremias 29:11" },
  { texto: "O Senhor é a minha luz e a minha salvação; a quem temerei?", ref: "Salmos 27:1" },
  { texto: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.", ref: "Isaías 40:31" },
  { texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", ref: "Isaías 41:10" },
  { texto: "E conhecereis a verdade, e a verdade vos libertará.", ref: "João 8:32" },
  { texto: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.", ref: "Filipenses 4:4" },
  { texto: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", ref: "1 Coríntios 13:4" },
  { texto: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.", ref: "Mateus 6:33" },
  { texto: "Porque onde estiverem dois ou três reunidos em meu nome, ali eu estou no meio deles.", ref: "Mateus 18:20" },
  { texto: "O Senhor é bom, uma fortaleza no dia da angústia; e conhece os que confiam nele.", ref: "Naum 1:7" },
  { texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", ref: "Mateus 11:28" },
  { texto: "Deem graças ao Senhor porque ele é bom; o seu amor dura para sempre.", ref: "Salmos 107:1" },
  { texto: "Porque para Deus nada é impossível.", ref: "Lucas 1:37" },
  { texto: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
  { texto: "Delight yourself in the Lord, and he will give you the desires of your heart.", ref: "Salmos 37:4" },
  { texto: "Deleita-te também no Senhor, e ele te concederá os desejos do teu coração.", ref: "Salmos 37:4" },
  { texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", ref: "Salmos 37:5" },
  { texto: "Aquele que habita no abrigo do Altíssimo descansará à sombra do Todo-Poderoso.", ref: "Salmos 91:1" },
  { texto: "Combati o bom combate, acabei a carreira, guardei a fé.", ref: "2 Timóteo 4:7" },
  { texto: "Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus.", ref: "Mateus 5:9" },
  { texto: "Eu vim para que tenham vida, e a tenham com abundância.", ref: "João 10:10" },
  { texto: "Sede fortes e corajosos. Não temais, nem vos espanteis, pois o Senhor, vosso Deus, está convosco por onde quer que andeis.", ref: "Josué 1:9" },
  { texto: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.", ref: "Filipenses 4:7" },
  { texto: "Pois nós somos feitura dele, criados em Cristo Jesus para boas obras.", ref: "Efésios 2:10" },
  { texto: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.", ref: "1 Tessalonicenses 5:18" },
  { texto: "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei em sua casa.", ref: "Apocalipse 3:20" },
  { texto: "Mas o fruto do Espírito é: amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio.", ref: "Gálatas 5:22-23" },
  { texto: "Grandes coisas fez o Senhor por nós, e por isso estamos alegres.", ref: "Salmos 126:3" },
  { texto: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.", ref: "Romanos 8:28" },
  { texto: "Não se amoldem ao padrão deste mundo, mas transformem-se pela renovação da sua mente.", ref: "Romanos 12:2" },
  { texto: "Sejam bondosos e compassivos uns para com os outros, perdoando-se mutuamente, assim como Deus os perdoou em Cristo.", ref: "Efésios 4:32" },
  { texto: "Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes, que não sabes.", ref: "Jeremias 33:3" },
  { texto: "O choro pode durar uma noite, mas a alegria vem pela manhã.", ref: "Salmos 30:5" },
  { texto: "Ele sarou os de coração quebrantado e ligou-lhes as feridas.", ref: "Salmos 147:3" },
  { texto: "Quão bom e quão suave é que os irmãos vivam em união!", ref: "Salmos 133:1" },
  { texto: "Ensina-nos a contar os nossos dias, para que alcancemos coração sábio.", ref: "Salmos 90:12" },
  { texto: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.", ref: "Filipenses 4:6" },
  { texto: "Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos.", ref: "Salmos 19:1" },
  { texto: "Cristo em vós, esperança da glória.", ref: "Colossenses 1:27" },
  { texto: "Se Deus é por nós, quem será contra nós?", ref: "Romanos 8:31" },
  { texto: "Buscai ao Senhor enquanto se pode achar, invocai-o enquanto está perto.", ref: "Isaías 55:6" },
  { texto: "Felizes os que têm fome e sede de justiça, pois serão satisfeitos.", ref: "Mateus 5:6" },
  { texto: "O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus.", ref: "Filipenses 4:19" },
  { texto: "E eis que eu estou convosco todos os dias, até à consumação dos séculos.", ref: "Mateus 28:20" },
  { texto: "Cria em mim, ó Deus, um coração puro, e renova em mim um espírito reto.", ref: "Salmos 51:10" },
  { texto: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo.", ref: "Salmos 23:4" },
  { texto: "Porque pela graça sois salvos, por meio da fé; e isso não vem de vós; é dom de Deus.", ref: "Efésios 2:8" },
  { texto: "Portanto, quer comais, quer bebais ou façais outra qualquer coisa, fazei tudo para a glória de Deus.", ref: "1 Coríntios 10:31" },
  { texto: "Ó profundidade das riquezas, tanto da sabedoria, como da ciência de Deus!", ref: "Romanos 11:33" },
  { texto: "Não vos conformeis com este mundo, mas sede transformados pela renovação do vosso entendimento.", ref: "Romanos 12:2" },
  { texto: "A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.", ref: "Hebreus 11:1" },
  { texto: "Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim.", ref: "João 14:6" },
  { texto: "Uns aos outros ajudai a levar as vossas cargas, e assim cumprireis a lei de Cristo.", ref: "Gálatas 6:2" },
  { texto: "O justo viverá pela fé.", ref: "Romanos 1:17" },
  { texto: "Olhai para as aves do céu: não semeiam, nem colhem, nem ajuntam em celeiros; e vosso Pai celestial as alimenta.", ref: "Mateus 6:26" },
  { texto: "Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome.", ref: "Salmos 103:1" },
  { texto: "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.", ref: "2 Coríntios 9:7" },
  { texto: "A misericórdia do Senhor é nova a cada manhã; grande é a tua fidelidade.", ref: "Lamentações 3:23" },
  { texto: "Tributai ao Senhor a glória devida ao seu nome; adorai o Senhor na beleza da santidade.", ref: "Salmos 29:2" },
  { texto: "Tende bom ânimo! Eu venci o mundo.", ref: "João 16:33" },
];

/**
 * Retorna o versículo do dia baseado na data atual.
 * Todos os usuários veem o mesmo versículo no mesmo dia.
 * O ciclo reinicia após passar por todos os versículos.
 */
function getVersiculoDoDia() {
  const hoje = new Date();
  const inicioAno = new Date(hoje.getFullYear(), 0, 0);
  const diff = hoje - inicioAno;
  const diaDoAno = Math.floor(diff / (1000 * 60 * 60 * 24));
  return VERSICULOS[diaDoAno % VERSICULOS.length];
}

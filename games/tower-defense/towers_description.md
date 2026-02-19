# Descrição das Torres

Escreva abaixo a descrição do que cada nova torre deve fazer:

- **weapon-anti-aereo.svg**: (Implementado) Torre antiaérea que ataca apenas inimigos voadores. Alta cadência de tiro e bom alcance. Custo: $300.
- **weapon-bazooka.svg**: (Implementado) Dispara foguetes que causam dano em área (explosão). Ataca terra e ar. Curto alcance, lento, mas destruidor. Custo: $500.
- **weapon-bowling.svg**: Bola de Boliche. Uso único. atravessa o campo da entrada até a saida, eliminando todos os inimigos terrestres em seu caminho, porém elimina tambem a torre que atingir. o caminho que a bola percorre é aleatorio. não tem upgrade. não fica parada; o usuário não escolhe onde ela vai nascer; o usuário não pode escolher bloquear ela. a única torre que impede a bola é a wall (eliminação mútua). Custo: $10.
- **weapon-cannon.svg**: (Implementado) Torre básica de artilharia. Ataca apenas inimigos terrestres. Dano moderado, recarga média. Custo: $50.
- **weapon-dice.svg**: rola o dado da sorte, se cair em 6, todos os inimigos em tela são eliminados, se cair em 1, todos os inimigos em tela são curados. Uso único por onda. Custo: $400.
- **weapon-heart-on-fire.svg**: Coração em fogo. Queimar sua vida para dobrar os ganhos. Cada torre consome um coração por onda, e multiplica os ganhos por 2. não tem upgrade. Custo: $1500.
- **weapon-lollipop.svg**: Pirulito-Armadilha. Cria uma poça de caramelo grudento. Inimigos que passam por cima (igual a mina terrestre), o quadrante fica extremamente lentos (90%), agrupando inimigos para ataques em área (Bazooka/foguete). Sem upgrade. Custo: $400. fica no solo para os inimigo terrestres passarem por cima e ficarem parados (quase). 1 range.
- **weapon-machine-gun.svg**: (Implementado) Metralhadora de alta velocidade. Dano baixo por tiro, mas muitos tiros por segundo. Apenas terrestre. Custo: $150.
- **weapon-mine.svg**: (Implementado) Mina terrestre explosiva. Único uso: explode quando um inimigo pisa, causando dano massivo em área. Custo: $500.
- **weapon-pacmam.svg**: Pacman. torre come inimigo. nasce no nível de upgrade 10. cada inimigo que come decresce o upgrade em 1. quando chega em 0, é eliminada. o usuário pode fazer o upgrade. somente inimigos terrestres podem ser eliminados. pode ser posicionada no meio do caminho igual a mina terrestre. Custo: $300.
- **weapon-poison.svg**: (Implementado) Torre de veneno/gelo. Não causa dano direto, mas cria uma aura que desacelera (30%) todos os inimigos na área. o upgrade aumenta o efeito em 3%, limitado a 90%. Custo: $150.
- **weapon-powerup.svg**: Torre aumento de poder. cada nível de upgrade da torre, o usuário aumenta o dano dos 'cannon' em 10%. Custo: $1000. só pode ter uma torre no mapa.
- **weapon-promoted.svg**: instala sobre uma torre. cada onda faz o upgrade da torre em 1. quando o usuário fica sem dinheiro, a torre é eliminada. Custo: $600.
- **weapon-sniper.svg**: (Implementado) Atirador de elite com alcance global (quase todo o mapa). Causa dano massivo (instakill em qualquer alvo) a um único alvo por vez. Recarga lenta. Custo: $250.
- **weapon-wall.svg**: (Implementado) Parede reforçada. Não ataca, serve apenas para bloquear o caminho e redirecionar os inimigos (Maze). sem upgrade Custo: $50.

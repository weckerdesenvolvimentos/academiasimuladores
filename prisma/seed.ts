import { PrismaClient } from '@prisma/client';
import { slugify } from '../lib/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar áreas
  const areas = [
    { name: 'Ciências Exatas', slug: slugify('Ciências Exatas') },
    { name: 'Ciências Humanas', slug: slugify('Ciências Humanas') },
    { name: 'Ciências Biológicas', slug: slugify('Ciências Biológicas') },
    { name: 'Engenharias', slug: slugify('Engenharias') },
    { name: 'Tecnologia da Informação', slug: slugify('Tecnologia da Informação') },
  ];

  console.log('📚 Criando áreas...');
  const createdAreas = [];
  for (const area of areas) {
    const existingArea = await prisma.area.findUnique({
      where: { name: area.name },
    });

    if (!existingArea) {
      const createdArea = await prisma.area.create({
        data: area,
      });
      createdAreas.push(createdArea);
      console.log(`✅ Área criada: ${createdArea.name}`);
    } else {
      createdAreas.push(existingArea);
      console.log(`ℹ️ Área já existe: ${existingArea.name}`);
    }
  }

  // Criar subáreas
  const subareas = [
    // Ciências Exatas
    { name: 'Matemática', areaName: 'Ciências Exatas' },
    { name: 'Física', areaName: 'Ciências Exatas' },
    { name: 'Química', areaName: 'Ciências Exatas' },
    { name: 'Estatística', areaName: 'Ciências Exatas' },

    // Ciências Humanas
    { name: 'História', areaName: 'Ciências Humanas' },
    { name: 'Geografia', areaName: 'Ciências Humanas' },
    { name: 'Filosofia', areaName: 'Ciências Humanas' },
    { name: 'Sociologia', areaName: 'Ciências Humanas' },

    // Ciências Biológicas
    { name: 'Biologia', areaName: 'Ciências Biológicas' },
    { name: 'Medicina', areaName: 'Ciências Biológicas' },
    { name: 'Enfermagem', areaName: 'Ciências Biológicas' },
    { name: 'Farmácia', areaName: 'Ciências Biológicas' },

    // Engenharias
    { name: 'Engenharia Civil', areaName: 'Engenharias' },
    { name: 'Engenharia Mecânica', areaName: 'Engenharias' },
    { name: 'Engenharia Elétrica', areaName: 'Engenharias' },
    { name: 'Engenharia de Software', areaName: 'Engenharias' },

    // Tecnologia da Informação
    { name: 'Programação', areaName: 'Tecnologia da Informação' },
    { name: 'Banco de Dados', areaName: 'Tecnologia da Informação' },
    { name: 'Redes de Computadores', areaName: 'Tecnologia da Informação' },
    { name: 'Inteligência Artificial', areaName: 'Tecnologia da Informação' },
  ];

  console.log('📖 Criando subáreas...');
  const createdSubareas = [];
  for (const subarea of subareas) {
    const area = createdAreas.find(a => a.name === subarea.areaName);
    if (!area) continue;

    const existingSubarea = await prisma.subarea.findUnique({
      where: {
        areaId_name: {
          areaId: area.id,
          name: subarea.name,
        },
      },
    });

    if (!existingSubarea) {
      const createdSubarea = await prisma.subarea.create({
        data: {
          name: subarea.name,
          areaId: area.id,
        },
      });
      createdSubareas.push(createdSubarea);
      console.log(`✅ Subárea criada: ${createdSubarea.name} (${area.name})`);
    } else {
      createdSubareas.push(existingSubarea);
      console.log(`ℹ️ Subárea já existe: ${existingSubarea.name} (${area.name})`);
    }
  }

  // Criar grupos de simuladores
  const groups = [
    {
      name: 'Simuladores de Matemática',
      context: 'Simuladores educacionais para ensino de matemática básica e avançada',
      codeBase: 'MATH',
    },
    {
      name: 'Simuladores de Física',
      context: 'Simuladores para experimentos virtuais de física',
      codeBase: 'PHYS',
    },
    {
      name: 'Simuladores de Química',
      context: 'Laboratórios virtuais de química e experimentos',
      codeBase: 'CHEM',
    },
    {
      name: 'Simuladores de Programação',
      context: 'Ambientes de aprendizado de programação e algoritmos',
      codeBase: 'PROG',
    },
    {
      name: 'Simuladores de Biologia',
      context: 'Simuladores para estudo de biologia e anatomia',
      codeBase: 'BIO',
    },
  ];

  console.log('🎮 Criando grupos de simuladores...');
  const createdGroups = [];
  for (const group of groups) {
    const existingGroup = await prisma.simulatorGroup.findFirst({
      where: { codeBase: group.codeBase },
    });

    if (!existingGroup) {
      const createdGroup = await prisma.simulatorGroup.create({
        data: group,
      });
      createdGroups.push(createdGroup);
      console.log(`✅ Grupo criado: ${createdGroup.name} (${createdGroup.codeBase})`);
    } else {
      createdGroups.push(existingGroup);
      console.log(`ℹ️ Grupo já existe: ${existingGroup.name} (${existingGroup.codeBase})`);
    }
  }

  // Criar simuladores de exemplo
  const simulators = [
    {
      groupName: 'Simuladores de Matemática',
      discipline: 'Cálculo Diferencial e Integral',
      areaName: 'Ciências Exatas',
      subareaName: 'Matemática',
      learningObjectives: 'Compreender os conceitos fundamentais de derivadas e integrais, aplicando-os em problemas práticos.',
      gameMechanics: 'Sistema de níveis progressivos com exercícios interativos, feedback imediato e gamificação.',
      kpis: 'Taxa de conclusão dos exercícios, tempo médio de resolução, precisão nas respostas.',
      syllabus: '<h2>Ementa do Curso</h2><p>Este simulador aborda os conceitos fundamentais do cálculo diferencial e integral através de exercícios interativos e visualizações gráficas.</p><h3>Conteúdo Programático:</h3><ul><li>Limites e continuidade</li><li>Derivadas e suas aplicações</li><li>Integrais definidas e indefinidas</li><li>Aplicações de integrais</li></ul>',
      devObjectives: '<h2>Objetivos de Desenvolvimento</h2><p>Desenvolver um simulador completo de cálculo com as seguintes funcionalidades:</p><h3>Sprint 1:</h3><ul><li>Interface básica do simulador</li><li>Sistema de exercícios simples</li></ul><h3>Sprint 2:</h3><ul><li>Visualizações gráficas</li><li>Sistema de feedback</li></ul>',
      isPublished: true,
    },
    {
      groupName: 'Simuladores de Física',
      discipline: 'Mecânica Clássica',
      areaName: 'Ciências Exatas',
      subareaName: 'Física',
      learningObjectives: 'Entender os princípios da mecânica newtoniana através de simulações interativas.',
      gameMechanics: 'Simulações de laboratório virtual com parâmetros ajustáveis e visualização em tempo real.',
      kpis: 'Número de experimentos realizados, precisão nas previsões, tempo de aprendizado.',
      syllabus: '<h2>Ementa do Curso</h2><p>Simulador de mecânica clássica com experimentos virtuais interativos.</p><h3>Conteúdo Programático:</h3><ul><li>Leis de Newton</li><li>Movimento em uma e duas dimensões</li><li>Energia e trabalho</li><li>Momento linear e colisões</li></ul>',
      devObjectives: '<h2>Objetivos de Desenvolvimento</h2><p>Criar um laboratório virtual de física com simulações realistas.</p>',
      isPublished: true,
    },
    {
      groupName: 'Simuladores de Programação',
      discipline: 'Algoritmos e Estruturas de Dados',
      areaName: 'Tecnologia da Informação',
      subareaName: 'Programação',
      learningObjectives: 'Dominar algoritmos fundamentais e estruturas de dados através de visualizações interativas.',
      gameMechanics: 'Editor de código integrado com visualização de execução passo a passo.',
      kpis: 'Número de algoritmos implementados, eficiência das soluções, tempo de debug.',
      syllabus: '<h2>Ementa do Curso</h2><p>Simulador para aprendizado de algoritmos e estruturas de dados com visualizações interativas.</p>',
      devObjectives: '<h2>Objetivos de Desenvolvimento</h2><p>Desenvolver um ambiente de programação visual e interativo.</p>',
      isPublished: false,
    },
  ];

  console.log('🎯 Criando simuladores de exemplo...');
  for (const simulator of simulators) {
    const group = createdGroups.find(g => g.name === simulator.groupName);
    const area = createdAreas.find(a => a.name === simulator.areaName);
    const subarea = createdSubareas.find(s => s.name === simulator.subareaName && s.areaId === area?.id);

    if (!group || !area || !subarea) {
      console.log(`⚠️ Dados não encontrados para simulador: ${simulator.discipline}`);
      continue;
    }

    // Verificar se já existe um simulador com este nome no grupo
    const existingSimulator = await prisma.simulatorDiscipline.findFirst({
      where: {
        groupId: group.id,
        discipline: simulator.discipline,
      },
    });

    if (existingSimulator) {
      console.log(`ℹ️ Simulador já existe: ${simulator.discipline}`);
      continue;
    }

    // Gerar código único
    const lastSimulator = await prisma.simulatorDiscipline.findFirst({
      where: { groupId: group.id },
      orderBy: { code: 'desc' },
    });

    let sequence = 1;
    if (lastSimulator) {
      const lastSequence = parseInt(lastSimulator.code.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    const code = `SIM-${group.codeBase}-${sequence.toString().padStart(3, '0')}`;

    const createdSimulator = await prisma.simulatorDiscipline.create({
      data: {
        groupId: group.id,
        discipline: simulator.discipline,
        areaId: area.id,
        subareaId: subarea.id,
        code,
        learningObjectives: simulator.learningObjectives,
        gameMechanics: simulator.gameMechanics,
        kpis: simulator.kpis,
        syllabus: simulator.syllabus,
        devObjectives: simulator.devObjectives,
        isPublished: simulator.isPublished,
      },
    });

    console.log(`✅ Simulador criado: ${createdSimulator.code} - ${createdSimulator.discipline}`);
  }

  // Criar roadmaps de exemplo
  console.log('🗺️ Criando roadmaps...');
  for (const group of createdGroups) {
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { groupId: group.id },
    });

    if (!existingRoadmap) {
      // Gerar valores aleatórios para RICE
      const reach = Math.floor(Math.random() * 50) + 30; // 30-80
      const impact = Math.floor(Math.random() * 50) + 30; // 30-80
      const confidence = Math.floor(Math.random() * 30) + 60; // 60-90
      const effort = Math.floor(Math.random() * 40) + 20; // 20-60
      const riceScore = (reach * impact * confidence) / effort;

      const statuses = ['IDEIA', 'PROTOTIPO', 'PILOTO', 'PRODUCAO'];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;

      const createdRoadmap = await prisma.roadmap.create({
        data: {
          groupId: group.id,
          status,
          reach,
          impact,
          confidence,
          effort,
          riceScore: Math.round(riceScore * 100) / 100,
        },
      });

      console.log(`✅ Roadmap criado para ${group.name}: RICE Score ${createdRoadmap.riceScore}`);
    } else {
      console.log(`ℹ️ Roadmap já existe para ${group.name}`);
    }
  }

  // Criar usuário admin de exemplo
  console.log('👤 Criando usuário admin...');
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@simuladores.com' },
  });

  if (!existingUser) {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@simuladores.com',
        name: 'Administrador',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Usuário admin criado: ${adminUser.email}`);
  } else {
    console.log(`ℹ️ Usuário admin já existe: ${existingUser.email}`);
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
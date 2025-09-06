-- Seed data for the simulator management system

-- Insert sample areas
INSERT INTO "areas" ("id", "name", "slug", "createdAt", "updatedAt") VALUES
('area_1', 'Ciências da Saúde', 'ciencias-da-saude', NOW(), NOW()),
('area_2', 'Engenharia', 'engenharia', NOW(), NOW()),
('area_3', 'Administração', 'administracao', NOW(), NOW()),
('area_4', 'Tecnologia da Informação', 'tecnologia-da-informacao', NOW(), NOW());

-- Insert sample subareas
INSERT INTO "subareas" ("id", "areaId", "name", "createdAt", "updatedAt") VALUES
('subarea_1', 'area_1', 'Medicina', NOW(), NOW()),
('subarea_2', 'area_1', 'Enfermagem', NOW(), NOW()),
('subarea_3', 'area_2', 'Engenharia Civil', NOW(), NOW()),
('subarea_4', 'area_2', 'Engenharia de Software', NOW(), NOW()),
('subarea_5', 'area_3', 'Gestão de Projetos', NOW(), NOW()),
('subarea_6', 'area_3', 'Recursos Humanos', NOW(), NOW()),
('subarea_7', 'area_4', 'Desenvolvimento Web', NOW(), NOW()),
('subarea_8', 'area_4', 'Inteligência Artificial', NOW(), NOW());

-- Insert sample simulator groups
INSERT INTO "simulator_groups" ("id", "name", "context", "codeBase", "createdAt", "updatedAt") VALUES
('group_1', 'Simuladores Médicos', 'Simuladores para treinamento médico e diagnóstico', 'MED-001', NOW(), NOW()),
('group_2', 'Simuladores de Engenharia', 'Simuladores para projetos de engenharia', 'ENG-001', NOW(), NOW()),
('group_3', 'Simuladores de Gestão', 'Simuladores para treinamento em gestão empresarial', 'GES-001', NOW(), NOW()),
('group_4', 'Simuladores de TI', 'Simuladores para desenvolvimento e programação', 'TI-001', NOW(), NOW());

-- Insert sample simulator disciplines
INSERT INTO "simulator_disciplines" (
    "id", "groupId", "discipline", "areaId", "subareaId", "code", 
    "learningObjectives", "gameMechanics", "kpis", "syllabus", 
    "devObjectives", "attachmentType", "isPublished", "createdAt", "updatedAt"
) VALUES
(
    'sim_1', 'group_1', 'Diagnóstico Clínico', 'area_1', 'subarea_1', 'MED-DIAG-001',
    'Desenvolver habilidades de diagnóstico clínico através de casos práticos',
    'Sistema de pontuação baseado em precisão diagnóstica e tempo de resposta',
    'Precisão diagnóstica: 85%, Tempo médio: 15 min, Taxa de conclusão: 90%',
    'Anatomia básica, Fisiopatologia, Sinais e sintomas, Exames complementares',
    'Implementar sistema de feedback em tempo real',
    'NONE', true, NOW(), NOW()
),
(
    'sim_2', 'group_2', 'Projetos de Estruturas', 'area_2', 'subarea_3', 'ENG-EST-001',
    'Aplicar conceitos de engenharia estrutural em projetos práticos',
    'Simulação de cargas e análise de tensões em estruturas',
    'Precisão de cálculos: 90%, Tempo de projeto: 2h, Aprovação: 85%',
    'Resistência dos materiais, Análise estrutural, Normas técnicas',
    'Integrar ferramentas de CAD',
    'NONE', true, NOW(), NOW()
),
(
    'sim_3', 'group_3', 'Gestão de Equipes', 'area_3', 'subarea_5', 'GES-EQU-001',
    'Desenvolver habilidades de liderança e gestão de equipes',
    'Simulação de cenários de conflito e tomada de decisão',
    'Satisfação da equipe: 80%, Produtividade: +15%, Retenção: 90%',
    'Liderança, Comunicação, Resolução de conflitos, Motivação',
    'Adicionar sistema de feedback 360°',
    'NONE', false, NOW(), NOW()
),
(
    'sim_4', 'group_4', 'Desenvolvimento Full-Stack', 'area_4', 'subarea_7', 'TI-FULL-001',
    'Praticar desenvolvimento completo de aplicações web',
    'Ambiente de desenvolvimento integrado com desafios progressivos',
    'Código funcional: 95%, Tempo de desenvolvimento: 4h, Qualidade: A',
    'Frontend (React), Backend (Node.js), Banco de dados, Deploy',
    'Implementar testes automatizados',
    'NONE', true, NOW(), NOW()
);

-- Insert sample roadmap
INSERT INTO "roadmap" (
    "id", "groupId", "status", "reach", "impact", "confidence", 
    "effort", "riceScore", "createdAt", "updatedAt"
) VALUES
('roadmap_1', 'group_1', 'PRODUCAO', 8.5, 9.0, 8.0, 7.0, 9.77, NOW(), NOW()),
('roadmap_2', 'group_2', 'PILOTO', 7.0, 8.5, 7.5, 8.0, 6.56, NOW(), NOW()),
('roadmap_3', 'group_3', 'PROTOTIPO', 6.5, 7.0, 6.0, 6.5, 6.46, NOW(), NOW()),
('roadmap_4', 'group_4', 'IDEIA', 9.0, 8.0, 5.0, 9.0, 4.00, NOW(), NOW());

-- Insert sample users
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") VALUES
('user_1', 'admin@simuladores.com', 'Administrador do Sistema', 'ADMIN', NOW(), NOW()),
('user_2', 'editor@simuladores.com', 'Editor Principal', 'EDITOR', NOW(), NOW()),
('user_3', 'viewer@simuladores.com', 'Visualizador', 'VIEWER', NOW(), NOW());

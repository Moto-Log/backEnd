export const Weight = {
    /**
	 * Peso para disciplinas que incidirem
	 */
    SUBJECT_INCIDENCE: 3,

    /**
	 * Peso para preferencias comuns que incidirem
	 */
    COMMON_INCIDENCE: 1,

    /**
	 * Fator determinante para a relação entre as CHS máxima
	 * de um docente e um coordenador, o valor deve ser obtido com
	 * base na razão entre CHS máxima do docente pela do coordenador.
	 * 
	 * Exemplo:
	 * 
	 * CHS Máxima Docente: 16
	 * 
	 * CHS Máxima Coordenador: 10
	 * 
	 * 16/10 = 1.6
	 */
    CHS_DIFF_ROLE_FACTOR: 1.6,
    
    /**
	 * Nível de importância da CHS faltante.
	 * O valor precisa ser maior que 0 para fazer
	 * com que o peso da diferença de CHS seja o mesmo
	 * das incidencias comuns, basta colocar o valor como
	 * 1 em razão da CHS_DIFF_ROLE_FACTOR.
	 * 
	 * Exemplo: 1/1.6 = 0.625
	 * 
	 * Isso faria com que as horas faltantes sempre tivessem valor 1
	 * independente da quantidade de horas, o valor tornaria-se 0 caso
	 * atingisse o máximo.
	 */
    CHS_DIFF_LEVEL_IMPORTANCE_FACTOR: 10,
};
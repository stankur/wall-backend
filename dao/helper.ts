const QueryHelper = {
	convertNullToZero: function (column: string) {
		return `(
            CASE
            WHEN ${column} IS NULL
            THEN 0
            ELSE ${column}
            END
        )`;
	},
	whicheverNotNull: function (...columns: string[]) {
		return `COALESCE(${columns.join(", ")})`;
	},
};

export { QueryHelper };
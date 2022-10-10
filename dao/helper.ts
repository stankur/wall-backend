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

const TypeFixer = {
	convertEachKeyToIntIfPossible: function (
		objArr: Record<any, any>[],
		...keys: any[]
	) {
		objArr.map(function (obj) {
			for (let key of keys) {
				if (typeof obj[key] === "string") {
					obj[key] = parseInt(obj[key]);
				}
			}

			return obj;
		});
	},
};
export { QueryHelper, TypeFixer };

const QueryHelper = {
	convertNullToZero: function (column: string) {
		return `COALESCE(${column}, 0)`;
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

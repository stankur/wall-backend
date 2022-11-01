interface IdentifiedParent {
	id: string;
}

function stitch<Parent extends IdentifiedParent, Child>(
	parents: Parent[],
	children: Child[],
	childParentId: keyof Child,
	stitchPoint: string,
	additionalParentCheck?: (parent: Parent) => void,
	additionalChildCheck?: (child: Child) => void
): (Parent & {
	[x: string]: Child[];
})[] {
	if (children.length === 0) {
		return parents.map(function (parent) {
			return { ...parent, [stitchPoint]: [] };
		});
	}

	if (parents.length === 0) {
		return [];
	}

	let sampleChild = children[0];

	if (typeof sampleChild[childParentId] !== "string") {
		throw new Error(
			"parent id type doesn't equal type of reference to parent's id in the child"
		);
	}

	let parentIndexes: Record<string, number> = {};

	let stitchedParents = parents.map(function (parent, index) {
		if (parent.id in parentIndexes) {
			throw new Error("parent id is not unique");
		}

		if (additionalParentCheck) {
			additionalParentCheck(parent);
		}

		parentIndexes[parent.id] = index;

		return { ...parent, [stitchPoint]: [] as Child[] };
	});

	children.map(function (child) {
		let parentId = child[childParentId];

		if (typeof parentId !== "string") {
			throw new Error("reference of parent id in child is not a string");
		}

		if (!(parentId in parentIndexes)) {
			throw new Error("a child's parent's id is not present");
		}

		if (additionalChildCheck) {
			additionalChildCheck(child);
		}

		let parentIndex = parentIndexes[parentId];

		stitchedParents[parentIndex][stitchPoint].push(child);
	});

	return stitchedParents;
}

function createIndexes<T extends IdentifiedParent>(source: T[]) {
	let indexes: Record<string, number> = {};

	source.map(function (elem, index) {
		if (elem.id in indexes) {
			throw new Error("element id is not unique");
		}

		indexes[elem.id] = index;
	});

	return indexes;
}

export { stitch, createIndexes };

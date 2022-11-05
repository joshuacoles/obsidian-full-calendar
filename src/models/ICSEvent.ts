import { MetadataCache, TFile, Vault, WorkspaceLeaf } from "obsidian";
import { EventFrontmatter, FCError } from "src/types";
import { CalendarEvent } from "./Event";

export class ICSEvent extends CalendarEvent {
	id: string;
	path: string;

	static ID_PREFIX = "ics";

	constructor(
		cache: MetadataCache,
		vault: Vault,
		data: EventFrontmatter,
		id: string
	) {
		super(cache, vault, data);
		this.id = id;
		this.path = `${"directory"}/${id}.md`;
	}

	async openIn(leaf: WorkspaceLeaf): Promise<void> {
		const file = this.vault.getAbstractFileByPath(this.path);
		if (file instanceof TFile) {
			await leaf.openFile(file);
		} else {
			throw new FCError(
				`Cannot find file for ICSEvent with ID ${this.id}.`
			);
		}
	}

	get PREFIX(): string {
		return ICSEvent.ID_PREFIX;
	}

	get identifier(): string {
		return this.id;
	}
}

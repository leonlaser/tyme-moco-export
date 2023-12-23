import MocoApiClient from "./MocoApiClient";
import MocoExporter from "./MocoExporter";

const apiClient = new MocoApiClient(formValue.mocoDomain, formValue.mocoApiKey);
const exporter = new MocoExporter(apiClient);

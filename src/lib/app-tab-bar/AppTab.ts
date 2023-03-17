import type {SvelteComponent} from "svelte";

export default interface AppTab {
    /**
     *
     */
    id: string;
    /**
     * tab的标签
     */
    label: string;
    /**
     * 内容的组件
     */
    component: SvelteComponent;
    /**
     * 最后一次使用的时间
     */
    latestActive: number;
}
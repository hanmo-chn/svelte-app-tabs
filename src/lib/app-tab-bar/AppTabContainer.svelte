<script lang="ts">
    import type AppTab from "./AppTab";
    import {onMount, SvelteComponent} from "svelte";
    import iconClose from "./icon_close.svg";
    import iconMore from "./icon-more.svg";
    import Popover from "@hanmotec/tsui-common";

    export let maxTabs: number = 6;
    export let capacity: number = 10;

    export const open = (id: string, label: string, component: SvelteComponent, props?: any):void => {
        let tab = tabs.find(item=>item.id===id);
        if (tab == null) {
            console.debug('新增标签页', id, label);
            tab = {id, label, component, props, latestActive: (new Date()).getTime()};
            if (tabs.length >= maxTabs) {
                let tabIdx = getMaxIdleTabIndex();
                let tabList = tabs.splice(tabIdx, 1);
                inactiveTabs = [...tabList, ...inactiveTabs];
                if (inactiveTabs.length > capacity) {
                    inactiveTabs.pop();
                    inactiveTabs = [...inactiveTabs];
                }
            }
            tabs = [...tabs, tab];
            activeTab = tab;
        } else {
            console.debug('打开旧标签页', id, label);
            activateTab(tab);
        }
    }

    let tabs:Array<AppTab> = [];
    let inactiveTabs:Array<AppTab> = [];
    let activeTab: AppTab = null;
    let tabBarStyle: string = '';

    const setTabBarWidth = () => {
        tabBarStyle = `grid-template-columns: repeat(${maxTabs}, 1fr) 40px`;
    }

    $: {
        if (maxTabs > 0) {
            setTabBarWidth();
        }
    }

    const activateTab = (tab:AppTab):void => {
        tab.latestActive = (new Date()).getTime();
        activeTab = tab;
        if (tabs.indexOf(tab) < 0) {
            /*将等待区的tab显示出来*/
            let idx = inactiveTabs.indexOf(tab);
            inactiveTabs.splice(idx, 1);
            let iaTab:AppTab = tabs.splice(getMaxIdleTabIndex(), 1)[0];
            inactiveTabs = [iaTab, ...inactiveTabs];
            tabs=[...tabs, tab];
            popover.close();
        }
    }


    const handleTabClick = (tab:AppTab):void => {
        window.location.hash = tab.id;
        console.log('切换地址：', window.location.hash);
    }

    /**
     * 找到空闲时间最长的标签
     */
    const getMaxIdleTabIndex = ():number => {
        let idx:number = 0;
        for (let i=1; i<tabs.length; i++) {
            if (tabs[i].latestActive < tabs[idx].latestActive) {
                idx = i;
            }
        }
        return idx;
    }

    /**
     * 找到空闲时间最长的标签
     */
    const getMinIdleTabIndex = ():number => {
        let idx:number = 0;
        for (let i=1; i<tabs.length; i++) {
            if (tabs[i].latestActive > tabs[idx].latestActive) {
                idx = i;
            }
        }
        return idx;
    }

    /**
     * 删除一个标签页
     * @param tab
     */
    const removeTab = (tab: AppTab):void => {
        let idx: number = tabs.indexOf(tab);
        if (idx > -1) {
            tabs.splice(idx, 1);
            if (tab == activeTab) {
                handleTabClick(tabs[getMinIdleTabIndex()]);
            }
        }
        if (inactiveTabs.length > 0) {
            tabs.push(inactiveTabs.pop());
            inactiveTabs = [...inactiveTabs];
        }
        tabs = [...tabs];
    }

    const removeInactiveTab = (tab: AppTab):void => {
        let idx: number = inactiveTabs.indexOf(tab);
        console.debug('关闭非活动的标签页', tab);
        inactiveTabs.splice(idx, 1);
        inactiveTabs = [...inactiveTabs];
    }

    let popover;

    onMount(()=>{
        setTabBarWidth();
    })

</script>
<div class="tsui-app-tab-container-wrapper">
    <div class="tsui-app-tab-container">
        <div class="tsui-app-tab-bar" style={tabBarStyle}>
            {#if tabs && tabs.length > 1}
                {#each tabs as tab}
                    <div class="tsui-app-tab" class:active={tab===activeTab} on:click={()=>handleTabClick(tab)}>
                        <div>
                            <span>{tab.label}</span>
                            <img style="color: #ff45ff" src={iconClose} on:click={()=>removeTab(tab)}/>
                        </div>
                    </div>
                {/each}
            {/if}
            {#if inactiveTabs && inactiveTabs.length>0}
                <div class="tsui-inactive-tabs">
                    <div class="btn-more"><img src={iconMore} on:click={()=>{popover.doOpen()}}/></div>
                    <Popover bind:this={popover} width="300" height="400" posX="right" offsetY="36">
                        <div class="tsui-popover-tabs">
                            {#each inactiveTabs as tab}
                                <div on:click={()=>{handleTabClick(tab)}}>
                                    <span>{tab.label}</span>
                                    <img on:click={(e)=>{removeInactiveTab(tab); e.stopPropagation();}} src={iconClose}/>
                                </div>
                            {/each}
                        </div>
                    </Popover>

                </div>
            {/if}
        </div>
        <div class="tsui-tab-panel-container">
            {#each tabs as tab}
                <div class="tsui-tab-panel" class:active={tab===activeTab}>
                    <svelte:component this={tab.component} {...tab.props}/>
                </div>
            {/each}
        </div>
    </div>
</div>
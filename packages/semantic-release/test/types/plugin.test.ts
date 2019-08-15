import { Context, ContextType, Plugin, Plugins, PluginsFunction, Step } from "../../src/types";

type Is<A extends B, B> = never;
type Eq<A extends B, B extends C, C = A> = never;

type $ContextTypes = Eq<keyof ContextType, Step> & Is<ContextType, Record<Step, Context>>;

// check `Plugin` context types
type PluginContextTypes = { [S in Step]: PluginFunctionContextType<S> };
type PluginFunctionContextType<S extends Step> = Plugin[S] extends (config: any, context: infer C) => any ? C : never;
type $Plugin$ContextTypes = Eq<PluginContextTypes, ContextType>;

// check `Plugins` functions
type $Plugins = Eq<Plugins, { [S in Step]: PluginsFunction<S> }>;

// check `Plugins` context types
type PluginsFunctionContextType<S extends Step> = Plugins[S] extends (context: infer C) => any ? C : never;
type PluginsContextTypes = { [S in Step]: PluginsFunctionContextType<S> };
type $Plugins$ContextTypes = Eq<PluginsContextTypes, ContextType>;

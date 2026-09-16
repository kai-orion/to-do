import { defineComponent, Teleport, type PropType } from 'vue'
import { RouterLink } from 'vue-router'
import type { NavLinkType } from '../../stores/navigation'
import css from './navigation-drawer.module.css'

export class NavigationDrawerComponent {

    private readonly props = {
        navLinks: {
            type: Object as PropType<Array<NavLinkType>>,
            required: true
        },
        modal: {
            type: Boolean as PropType<boolean>,
            default: false
        },
        open: {
            type: Boolean as PropType<boolean>,
            default: true,
        }
    }

    public readonly component = defineComponent({
        name: 'NavigationDrawer',
        props: this.props,
        emits: {
            scrimClick: null
        },
        data: () => ({
        }),
        render() {
            const renderLinks = this.navLinks!.map(link => (
                <RouterLink to={link.url} class={css['nav-button']} activeClass={css.active} exactActiveClass={css['extra-active']}>
                    <md-icon class={css.start}>{link.iconString}</md-icon>
                    <span class={css.label}>{link.label}</span>
                    <span class={css.alert}></span>
                    <md-ripple></md-ripple>
                </RouterLink>
            ))
            
            const renderNavigationDrawer = (
                <div class={[css['navigation-drawer'], this.modal && css.modal, this.open && css.open]}>
                    <div class={css['nav-buttons']}>
                        {renderLinks}
                    </div>
                    <md-elevation></md-elevation>
                </div>
            )
            const renderModalNavigationDrawer = (
                <Teleport to="body">
                    {renderNavigationDrawer}
                    <span class={[css.scrim, this.open && css.open]} onClick={() => this.$emit('scrimClick')}></span>
                </Teleport>
            )
            return (
                this.modal ? renderModalNavigationDrawer : renderNavigationDrawer
            )
        }
    })
}

export const NavigationDrawer = new NavigationDrawerComponent().component

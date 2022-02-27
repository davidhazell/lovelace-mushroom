import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import { computeCloseIcon, computeOpenIcon } from "../../../utils/icons/cover-icon";
import {
    isClosing,
    isFullyClosed,
    isFullyOpen,
    isOpening,
    supportsClose,
    supportsOpen,
    supportsStop,
} from "../utils";

@customElement("mushroom-cover-buttons-control")
export class CoverButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    private _onOpenTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "open_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onCloseTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "close_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onStopTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "stop_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _computeOpenDisabled(): boolean {
        if (this.entity.state === "unavailable") {
            return true;
        }
        const assumedState = this.entity.attributes.assumed_state === true;
        return (isFullyOpen(this.entity) || isOpening(this.entity)) && !assumedState;
    }

    private _computeClosedDisabled(): boolean {
        if (this.entity.state === "unavailable") {
            return true;
        }
        const assumedState = this.entity.attributes.assumed_state === true;
        return (isFullyClosed(this.entity) || isClosing(this.entity)) && !assumedState;
    }

    private _computePauseDisabled(): boolean {
        return this.entity.state === "unavailable";
    }

    protected render(): TemplateResult {
        const assumedState = this.entity.attributes.assumed_state === true;

        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                ${supportsClose(this.entity)
                    ? html`
                          <mushroom-button
                              .icon=${computeCloseIcon(this.entity)}
                              .disabled=${this._computeClosedDisabled()}
                              @click=${this._onCloseTap}
                          ></mushroom-button>
                      `
                    : undefined}
                ${supportsStop(this.entity)
                    ? html`
                          <mushroom-button
                              icon="mdi:pause"
                              .disabled=${this._computePauseDisabled()}
                              @click=${this._onStopTap}
                          ></mushroom-button>
                      `
                    : undefined}
                ${supportsOpen(this.entity)
                    ? html`
                          <mushroom-button
                              .icon=${computeOpenIcon(this.entity)}
                              .disabled=${this._computeOpenDisabled()}
                              @click=${this._onOpenTap}
                          ></mushroom-button>
                      `
                    : undefined}
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            :host *:not(:last-child) {
                margin-right: var(--spacing);
            }
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container.fill mushroom-button {
                flex: 1;
            }
        `;
    }
}

/*!
 * @license
 * Copyright 2017 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { MinimalNodeEntryEntity, PathElementEntity, PathInfoEntity } from 'alfresco-js-api';
import { NodesApiService } from 'ng2-alfresco-core';
import { DocumentListComponent } from 'ng2-alfresco-documentlist';

import { ContentManagementService } from '../../common/services/content-management.service';
import { PageComponent } from '../page.component';

@Component({
    templateUrl: './favorites.component.html'
})
export class FavoritesComponent extends PageComponent implements OnInit, OnDestroy {

    @ViewChild(DocumentListComponent)
    documentList: DocumentListComponent;

    private onEditFolder: Subscription;
    private onMoveNode: Subscription;
    private onToggleFavorite: Subscription;

    constructor(
        private router: Router,
        private nodesApi: NodesApiService,
        private content: ContentManagementService) {
        super();
    }

    ngOnInit() {
        this.onEditFolder = this.content.editFolder.subscribe(() => this.refresh());
        this.onMoveNode = this.content.moveNode.subscribe(() => this.refresh());
        this.onToggleFavorite = this.content.toggleFavorite
            .debounceTime(300).subscribe(() => this.refresh());
    }

    ngOnDestroy() {
        this.onEditFolder.unsubscribe();
        this.onMoveNode.unsubscribe();
        this.onToggleFavorite.unsubscribe();
    }

    fetchNodes(): void {
        // todo: remove once all views migrate to native data source
    }

    navigate(favorite: MinimalNodeEntryEntity) {
        const { isFolder, id } = favorite;

        // TODO: rework as it will fail on non-English setups
        const isSitePath = (path: PathInfoEntity): boolean => {
            return path.elements.some(({ name }: PathElementEntity) => (name === 'Sites'));
        };

        if (isFolder) {
            this.nodesApi
                .getNode(id)
                .subscribe(({ path }: MinimalNodeEntryEntity) => {
                    const routeUrl = isSitePath(path) ? '/libraries' : '/personal-files';
                    this.router.navigate([ routeUrl, id ]);
                });
        }
    }

    onNodeDoubleClick(node: MinimalNodeEntryEntity) {
        if (node) {
            if (node.isFolder) {
                this.navigate(node);
            }

            if (node.isFile) {
                this.router.navigate(['/preview', node.id]);
            }
        }
    }

    refresh(): void {
        if (this.documentList) {
            this.documentList.reload();
        }
    }
}
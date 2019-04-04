import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent, NotFoundModule } from './not-found/not-found.component';
import { UserService } from './authent/user.service';
import { FilesComponent, FilesModule } from './files/files.component';
import { SeedsComponent, SeedsModule } from './seeds/seeds.component';
import { AuthGuard } from './authent/auth.guard';
import { WindowService } from './utils/window/window.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/seeds',
    pathMatch: 'full'
  },
  {
    path: 'seeds',
    component: SeedsComponent,
    canActivate: [AuthGuard],
    data: {
      label: 'label.seeds',
      menu: true,
      iconType: 'icon',
      icon: 'home'
    }
  },
  {
    path: 'files',
    component: FilesComponent,
    canActivate: [AuthGuard],
    data: {
      label: 'label.files',
      menu: true,
      iconType: 'icon',
      icon: 'folder'
    }
  },
  // Show the 404 page for any routes that don't exist.
  {
    path: '**',
    component: NotFoundComponent,
    data: {
      label: 'route.not-found',
      menu: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), SeedsModule, FilesModule, NotFoundModule],
  exports: [RouterModule],
  providers: [UserService, WindowService]
})
export class AppRoutingModule {}

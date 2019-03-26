import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent, NotFoundModule } from './not-found/not-found.component';
//import { AuthGuard } from './components/authent/auth.guard';
import { UserService } from './authent/user.service';
import { FilesComponent, FilesModule } from './files/files.component';
import { SeedsComponent, SeedsModule } from './seeds/seeds.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/seeds',
    pathMatch: 'full'
  },
  {
    path: 'seeds',
    component: SeedsComponent,
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
  providers: [UserService]
})
export class AppRoutingModule {}
